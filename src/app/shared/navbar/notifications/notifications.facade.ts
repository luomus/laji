import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, forkJoin, Subject } from 'rxjs';
import { PagedResult } from 'app/shared/model/PagedResult';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { LajiApi, LajiApiService } from 'app/shared/service/laji-api.service';
import { UserService } from 'app/shared/service/user.service';
import { Notification } from 'app/shared/model/Notification';

/**
 * REFACTOR PLAN
1. get unseen notification count (on navbar load)
2. get total notification count and initialize datasource with it
3. bind notification sub to datasource
4. let datasource call fetchpage

- remove, mark as seen: remain unchanged
- loadAll/subscribeAll/reduceAll are removed
- loading is removed: instead initialize datasource with empty "loading" objects that are then treated as ghosts in UI

UI CHANGES
- scroll container has a static px width
- notification component container gets 'display: flex' and the "left side" gets 'flex-grow: 1'
- pagination indicator is removed
- pagination controls are removed
 */

interface State {
  notifications: PagedResult<Notification>;
  unseenCount: number;
  loading: boolean;
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
    unseenCount: 0,
    loading: true
  });

  state$: Observable<State> = this.store$.asObservable();
  notifications$: Observable<PagedResult<Notification>> = this.store$.asObservable().pipe(
    map(state => state.notifications),
    distinctUntilChanged()
  );

  private _loading = 0;

  constructor(private userService: UserService, private lajiApi: LajiApiService) {}

  private allReducer(data: {notifications, unseen}) {
      this.store$.next({
        ...this.store$.getValue(), notifications: data.notifications, unseenCount: data.unseen
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

  private loadingReducer(loading: boolean) {
      this.store$.next({
        ...this.store$.getValue(), loading
      });
  }

  private incrementLoading() {
    if (this._loading >= 0) {
      this.loadingReducer(true);
    }
    this._loading++;
  }

  private decrementLoading() {
    this._loading--;
    if (this._loading <= 0) {
      this.loadingReducer(false);
    }
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
      of({}).pipe(
        tap(this.incrementLoading.bind(this)),
        switchMap(() => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
          personToken: this.userService.getToken(),
          page: page,
          pageSize: pageSize
        })),
        tap(this.decrementLoading.bind(this))
      ),
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
