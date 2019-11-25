import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin, Subject } from 'rxjs';
import { PagedResult } from 'app/shared/model/PagedResult';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { LajiApi, LajiApiService } from 'app/shared/service/laji-api.service';
import { UserService } from 'app/shared/service/user.service';
import { Notification } from 'app/shared/model/Notification';

interface State {
  notifications: PagedResult<Notification>;
  unseenCount: number;
}

const subscribeWithWrapper = (observable: Observable<any>, callback?) => {
  const subject = new Subject<void>();
  observable.subscribe((res) => {
    if (callback) { callback(res); }
    subject.next();
    subject.complete();
  });
  return subject.asObservable();
};

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

  private localUnseenCountReducer(amount = 1) {
    const currentState = this.store$.getValue();
    const unseenCount = currentState.unseenCount - amount;
    this.store$.next({
      ...currentState, unseenCount
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
    return subscribeWithWrapper(
      this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: page,
        pageSize: pageSize
      }).pipe(
        switchMap((notifications) => forkJoin(of(notifications), this.getUnseenNotificationsCount$(notifications, pageSize))),
        map((res) => ({notifications: res[0], unseen: res[1]}))
      ),
      this.allReducer.bind(this)
    );
  }

  private subscribeNotifications(page = 0, pageSize = 5): Observable<void> {
    return subscribeWithWrapper(
      this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: page,
        pageSize: pageSize
      }),
      this.notificationsReducer.bind(this)
    );
  }

  private subscribeUnseenCount() {
    return subscribeWithWrapper(
      this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: 1,
        pageSize: 1,
        onlyUnSeen: true
      }).pipe(
        map(unseen => unseen.total || 0)
      ),
      this.unseenCountReducer.bind(this)
    );
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

  private subscribeMarkAsSeen(notification: Notification): Observable<void> {
    if (notification.seen) {
      const subject = new Subject<void>();
      subject.complete();
      return subject.asObservable();
    }
    notification.seen = true;
    return subscribeWithWrapper(
      this.lajiApi.update(LajiApi.Endpoints.notifications, notification, {personToken: this.userService.getToken()}),
      this.localUnseenCountReducer.bind(this, [1])
    );
  }

  markAsSeen(notification: Notification): Observable<void> {
    return subscribeWithWrapper(this.subscribeMarkAsSeen(notification).pipe(
      switchMap(() => this.subscribeNotifications())
    ));
  }

  markAllAsSeen(): Observable<void> {
    return subscribeWithWrapper(this.notifications$.pipe(
      switchMap((notifications) => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: 0,
        pageSize: notifications.total
      })),
      switchMap((notifications) => forkJoin(notifications.results.map((notification) => this.subscribeMarkAsSeen(notification)))),
      switchMap(() => this.subscribeNotifications())
    ));
  }

  private subscribeRemove(notification: Notification): Observable<void> {
    if (!notification || !notification.id) {
      const subject = new Subject<void>();
      subject.error('Notification not provided.');
      return subject;
    }
    if (!notification.seen) {
      this.localUnseenCountReducer();
    }
    return subscribeWithWrapper(
      this.lajiApi.remove(LajiApi.Endpoints.notifications, notification.id, {personToken: this.userService.getToken()})
    );
  }

  remove(notification: Notification): Observable<void> {
    return subscribeWithWrapper(
      this.subscribeRemove(notification).pipe(
        switchMap(() => this.subscribeNotifications())
      )
    );
  }

  removeAll(): Observable<void> {
    return subscribeWithWrapper(this.notifications$.pipe(
      switchMap((notifications) => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: 0,
        pageSize: notifications.total
      })),
      switchMap((notifications) => forkJoin(notifications.results.map((notification) => this.subscribeRemove(notification)))),
      switchMap(() => this.subscribeNotifications())
    ));
  }
}
