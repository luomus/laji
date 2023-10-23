import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of, from, EMPTY } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap, take, concatMap, toArray, filter, catchError } from 'rxjs/operators';
import { GraphQLService } from '../../../graph-ql/service/graph-ql.service';
import gql from 'graphql-tag';
import { PagedResult } from '../../../shared/model/PagedResult';
import { UserService } from '../../../shared/service/user.service';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { Notification } from '../../../shared/model/Notification';

interface State {
  notifications: PagedResult<Notification>;
  unseenCount: number;
  loading: boolean;
}

interface IRefreshDataResult {
  notifications: PagedResult<Notification>;
  unseenCount: {
    total: number;
  };
}

const NOTIFICATION_MAX_PAGESIZE = 100;

const REFRESH_QUERY = gql`
  query($pageSize: Int, $personToken: String = "") {
    notifications(personToken: $personToken, pageSize: $pageSize) {
      total
      results {
        id
      }
    }
    unseenCount: notifications(personToken: $personToken, onlyUnSeen: true, pageSize: 0) {
      total
    }
  }
`;

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
    loading: false
  });

  state$: Observable<State> = this.store$.asObservable();
  notifications$: Observable<PagedResult<Notification>> = this.state$.pipe(
    map(state => state.notifications),
    distinctUntilChanged()
  );
  total$: Observable<number> = this.state$.pipe(
    map(state => state.notifications.total || 0),
    distinctUntilChanged()
  );
  unseenCount$: Observable<number> = this.state$.pipe(
    map(state => state.unseenCount),
    distinctUntilChanged()
  );
  loading$: Observable<boolean> = this.state$.pipe(
    map(state => state.loading),
    distinctUntilChanged()
  );

  readonly pageSize = 20;

  constructor(
    private userService: UserService,
    private lajiApi: LajiApiService,
    private graphQLService: GraphQLService
  ) {}

  private notificationsReducer(notifications: PagedResult<Notification>) {
    this.store$.next({
      ...this.store$.getValue(), notifications
    });
  }

  private totalReducer(total: number) {
    const curr = this.store$.getValue();
    this.store$.next({
      ...curr, notifications: { ...curr.notifications, total }
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

  private loadingReducer(loading: boolean) {
    this.store$.next({
      ...this.store$.getValue(), loading
    });
  }

  checkForNewNotifications() {
    this.graphQLService.query<IRefreshDataResult>({
      query: REFRESH_QUERY,
      fetchPolicy: 'network-only',
      variables: {personToken: this.userService.getToken(), pageSize: 1}
    }).pipe(
      map(({data}) => data),
      catchError(() => of({unseenCount: {total: 0}, notifications: {total: 0, results: []}}))
    ).subscribe((data) => {
      this.unseenCountReducer(data.unseenCount.total);
      const curr = this.store$.getValue();

      // get total count from graphql to avoid api query until the dropdown is opened
      if (curr.notifications.total === 0 && data.notifications.total !== 0) {
        this.totalReducer(data.notifications.total);
      }

      // reload if new notifications are detected
      if (
        data.notifications &&
        data.notifications.total > 0 &&
        // no need to reload notifications if the dropdown has not been opened
        curr.notifications?.pageSize > 0 &&
        curr.notifications?.results[0]?.id !== data.notifications.results[0].id
      ) {
        this.loadNotifications(1);
      }
    });
  }

  loadNotifications(page) {
    this.loadingReducer(true);
    this.lajiApi.getList(LajiApi.Endpoints.notifications, {
      personToken: this.userService.getToken(),
      page,
      pageSize: this.pageSize
    }).pipe(
      catchError(() => EMPTY)
    ).subscribe((notifications) => {
      this.notificationsReducer(notifications);
      this.loadingReducer(false);
    });
  }

  loadUnseenCount() {
    this.lajiApi.getList(LajiApi.Endpoints.notifications, {
      personToken: this.userService.getToken(),
      page: 1,
      pageSize: 1,
      onlyUnSeen: true
    }).pipe(
      map(unseen => unseen.total || 0),
      catchError(() => of(0))
    ).subscribe(this.unseenCountReducer.bind(this));
  }

  markAsSeen(notification: Notification) {
    if (notification.seen) {
      return;
    }
    notification.seen = true;
    this.lajiApi.update(
      LajiApi.Endpoints.notifications,
      notification, {personToken: this.userService.getToken()}
    ).subscribe(this.localUnseenCountReducer.bind(this, 1));
  }

  markAllAsSeen() {
    this.loadingReducer(true);
    this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>  {
        const count = Math.ceil(notifications.total / NOTIFICATION_MAX_PAGESIZE);
        const arr = new Array(count).fill('').map((val, idx) => idx + 1);
        return of(...arr);
      }),
      concatMap((idx: number) => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: idx,
        pageSize: NOTIFICATION_MAX_PAGESIZE
      })),
      tap((notifications) => this.notificationsReducer(
          {...notifications, results: notifications.results.map((notification) => ({...notification, seen: true}))}
      )),
      switchMap((notifications) => from(notifications.results)),
      filter(notification => !notification.seen),
      tap(notification => this.markAsSeen(notification)),
      toArray()
    ).subscribe(this.loadingReducer.bind(this, false));
  }

  remove(notification: Notification) {
    if (!notification || !notification.id) {
      console.warn('Notification not provided.');
    }
    if (!notification.seen) {
      this.localUnseenCountReducer();
    }

    this.loadingReducer(true);
    this.lajiApi.remove(
      LajiApi.Endpoints.notifications,
      notification.id,
      {personToken: this.userService.getToken()}
    ).subscribe(this.loadingReducer.bind(this, false));
  }

  removeAll() {
    this.loadingReducer(true);
    this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>  {
        const count = Math.ceil(notifications.total / NOTIFICATION_MAX_PAGESIZE);
        const arr = new Array(count).fill('').map((val, idx) => idx + 1);
        return from(arr);
      }),
      concatMap((idx: number) => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: idx,
        pageSize: NOTIFICATION_MAX_PAGESIZE
      }).pipe(
        catchError(() => of({results: []}))
      )),
      toArray(),
      switchMap(data => from(data)),
      concatMap((notifications) => from(notifications.results)),
      tap(notification => this.remove(notification)),
      toArray(),
      tap(() => this.loadNotifications(1))
    ).subscribe();
  }
}
