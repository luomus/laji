import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin, Subject } from 'rxjs';
import { PagedResult } from 'app/shared/model/PagedResult';
import { distinctUntilChanged, map, switchMap, filter, mergeMap } from 'rxjs/operators';
import { LajiApi, LajiApiService } from 'app/shared/service/laji-api.service';
import { UserService } from 'app/shared/service/user.service';
import { Notification } from 'app/shared/model/Notification';

interface State {
  notifications: PagedResult<Notification>;
  unseenCount: number;
}

@Injectable()
export class NotificationsFacade {
  private store$ = new BehaviorSubject<State>({
    notifications: {
      currentPage: 0,
      pageSize: 0,
      total: 0,
      results: []
    },
    unseenCount: 0
  });

  state$: Observable<State> = this.store$.asObservable();
  notifications$: Observable<PagedResult<Notification>> = this.store$.asObservable().pipe(
    map(state => state.notifications),
    distinctUntilChanged()
  );

  constructor(private userService: UserService, private lajiApi: LajiApiService) {}

  private allReducer(data: {notifications, unseen}) {
      this.store$.next({
          notifications: data.notifications, unseenCount: data.unseen
      });
  }

  private notificationsReducer(notifications: PagedResult<Notification>) {
      this.store$.next({
        ...this.store$.getValue(), notifications
      });
  }

  private unseenCountReducer(unseenCount: number) {
      this.store$.next({
        ...this.store$.getValue(), unseenCount
      });
  }

  private getUnseenNotificationsCount$(notifications: PagedResult<Notification>, pageSize: number): Observable<number> {
    const allNotificationsInCurrentPage = notifications.total <= pageSize;
    const fromCurrentPage = () => {
      return of(notifications.results.reduce((cumulative, current) => cumulative + (current.seen ? 0 : 1), 0));
    };
    const fromApi = () => {
      return this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: 1,
        pageSize: 1,
        onlyUnSeen: true
      }).pipe(
        map(unseen => unseen.total || 0)
      );
    };

    return allNotificationsInCurrentPage ? fromCurrentPage() : fromApi();
  }

  private subscribeAll(page, pageSize) {
    this.userService.isLoggedIn$.pipe(
      filter(isLoggedIn => isLoggedIn),
      switchMap(() => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: page,
        pageSize: pageSize
      })),
      switchMap((notifications) => forkJoin(of(notifications), this.getUnseenNotificationsCount$(notifications, pageSize))),
      map((res) => ({notifications: res[0], unseen: res[1]}))
    ).subscribe(this.allReducer.bind(this));
  }

  private subscribeNotifications(page = 0, pageSize = 10) {
    this.userService.isLoggedIn$.pipe(
      filter(isLoggedIn => isLoggedIn),
      switchMap(() => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: page,
        pageSize: pageSize
      }))
    ).subscribe(this.notificationsReducer.bind(this));
  }

  private subscribeUnseenCount() {
    this.userService.isLoggedIn$.pipe(
      filter(isLoggedIn => isLoggedIn),
      switchMap(() => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: 1,
        pageSize: 1,
        onlyUnSeen: true
      })),
      map(unseen => unseen.total || 0)
    ).subscribe(this.unseenCountReducer.bind(this));
  }

  private reduceUnseenCountLocally(amount = 1) {
    const currentState = this.store$.getValue();
    const unseenCount = currentState.unseenCount - amount;
    this.store$.next({
      ...currentState, unseenCount
    });
  }

  loadNotifications(page, pageSize) {
    this.subscribeNotifications(page, pageSize);
  }

  loadUnseenCount() {
    this.subscribeUnseenCount();
  }

  loadAll(page, pageSize) {
    this.subscribeAll(page, pageSize);
  }

  markAsSeen(notification: Notification): Observable<void> {
    const subject = new Subject<void>();
    if (notification.seen) {
      subject.error('Notification already seen.');
      return subject;
    }
    notification.seen = true;
    this.lajiApi
      .update(LajiApi.Endpoints.notifications, notification, {personToken: this.userService.getToken()})
      .subscribe(() => {
        subject.next();
        subject.complete();
        this.reduceUnseenCountLocally();
      });
    return subject.asObservable();
  }

  markAllAsSeen() {
    // Note: starts a lot of api requests... requires server side changes for improved performance
    this.notifications$.subscribe((notifications) => {
      notifications.results.forEach((notification) => this.markAsSeen(notification));
    });
  }

  remove(notification: Notification): Observable<void> {
    const subject = new Subject<void>();
    if (!notification || !notification.id) {
      subject.error('Notification not provided.');
      return subject;
    }
    if (!notification.seen) {
      this.reduceUnseenCountLocally();
    }
    this.lajiApi
      .remove(LajiApi.Endpoints.notifications, notification.id, {personToken: this.userService.getToken()})
      .subscribe(() => {
        subject.next();
        subject.complete();
      });
    return subject.asObservable();
  }

  removeAll() {
    // Note: starts a lot of api requests... requires server side changes for improved performance
    this.notifications$.subscribe((notifications) => {
      notifications.results.forEach((notification) => this.remove(notification));
    });
  }
}
