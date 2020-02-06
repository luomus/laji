import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, Subject } from 'rxjs';
import { PagedResult } from 'app/shared/model/PagedResult';
import { distinctUntilChanged, map, switchMap, tap, take } from 'rxjs/operators';
import { LajiApi, LajiApiService } from 'app/shared/service/laji-api.service';
import { UserService } from 'app/shared/service/user.service';
import { Notification } from 'app/shared/model/Notification';
import { GraphQLService } from '../../../graph-ql/service/graph-ql.service';
import gql from 'graphql-tag';

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

  pageSize = 5;

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
      switchMap((notifications) => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: 1,
        pageSize: notifications.total
      })),
      tap((notifications) => this.notificationsReducer(
          {...notifications, results: notifications.results.map((notification) => ({...notification, seen: true}))}
      )),
      switchMap((notifications) => forkJoin(notifications.results.map((notification) => this.subscribeMarkAsSeen(notification))))
    ));
  }

  remove(notification: Notification): Observable<void> {
    return subscribeWithWrapper(
      this.subscribeRemove(notification)
    );
  }

  removeAll(): Observable<void> {
    return subscribeWithWrapper(this.notifications$.pipe(
      switchMap((notifications) => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
        personToken: this.userService.getToken(),
        page: 0,
        pageSize: notifications.total
      })),
      switchMap((notifications) => forkJoin(notifications.results.map((notification) => this.subscribeRemove(notification))))
    ));
  }
}
