import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of, from } from 'rxjs';
import { distinctUntilChanged, map, switchMap, tap, take, concatMap, toArray, filter, catchError } from 'rxjs/operators';
import { GraphQLService } from '../../../graph-ql/service/graph-ql.service';
import gql from 'graphql-tag';
import { PagedResult } from '../../model/PagedResult';
import { UserService } from '../../service/user.service';
import { LajiApi, LajiApiService } from '../../service/laji-api.service';
import { Notification } from '../../model/Notification';

interface State {
  notifications: PagedResult<Notification>;
  unseenCount: number;
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
      currentPage
      pageSize
      total
      results {
        id
        created
        friendRequest
        friendRequestAccepted
        seen
        toPerson
        annotation {
          rootID
          targetID
          annotationByPerson
          annotationBySystem
        }
      }
    }
    unseenCount: notifications(personToken: $personToken, onlyUnSeen: true, pageSize: 0) {
      total
    }
  }
`;

const subscribeWithWrapper = (observable: Observable<any>, callback?) => {
  const subject = new Subject<void>();
  observable.pipe(take(1)).subscribe((res) => {
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

  private subscribeNotifications(page = 1) {
    this.lajiApi.getList(LajiApi.Endpoints.notifications, {
      personToken: this.userService.getToken(),
      page: page,
      pageSize: this.pageSize
    }).subscribe(this.notificationsReducer.bind(this));
  }

  private subscribeUnseenCount() {
    this.lajiApi.getList(LajiApi.Endpoints.notifications, {
      personToken: this.userService.getToken(),
      page: 1,
      pageSize: 1,
      onlyUnSeen: true
    }).pipe(
      map(unseen => unseen.total || 0)
    ).subscribe(this.unseenCountReducer.bind(this));
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

  checkForNewNotifications() {
    this.graphQLService.query<IRefreshDataResult>({
      query: REFRESH_QUERY,
      fetchPolicy: 'network-only',
      variables: {personToken: this.userService.getToken(), pageSize: this.pageSize}
    }).pipe(
      map(({data}) => data),
    ).subscribe((data) => {
      this.unseenCountReducer(data.unseenCount.total);
      this.notificationsReducer(data.notifications);
    });
  }

  loadNotifications(page) {
    this.subscribeNotifications(page);
  }

  loadUnseenCount() {
    this.subscribeUnseenCount();
  }

  markAsSeen(notification: Notification): Observable<void> {
    return subscribeWithWrapper(this.subscribeMarkAsSeen(notification));
  }

  markAllAsSeen(): Observable<void> {
    return subscribeWithWrapper(this.notifications$.pipe(
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
      concatMap(notification => this.subscribeMarkAsSeen(notification)),
      toArray(),
    ));
  }

  remove(notification: Notification): Observable<void> {
    return subscribeWithWrapper(
      this.subscribeRemove(notification)
    );
  }

  removeAll(): Observable<void> {
    return subscribeWithWrapper(this.notifications$.pipe(
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
      concatMap(notification => this.subscribeRemove(notification)),
      toArray()
    ));
  }
}
