import { DataSource, CollectionViewer, ListRange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NotificationsFacade } from './notifications.facade';
import { Notification } from '../../model/Notification';
import { takeUntil } from 'rxjs/operators';

const arrPushFront = <T>(amt: number, value: any, arr: Array<T>): T[] => new Array(amt).fill(value).concat(arr);
const setFilter = <T>(set: Set<T>, callbackfn: (int) => boolean) => new Set([...set].filter(page => callbackfn(page)));

export class NotificationDataSource extends DataSource<Notification> {
  private unsubscribe$ = new Subject<void>();

  private data$ = new BehaviorSubject<Notification[]>(undefined);
  private cachedData: Notification[] = [];
  private fetchedPages = new Set<number>();
  private lastViewedRange: ListRange = {start: 0, end: 1};

  constructor(private facade: NotificationsFacade) {
    super();
    facade.notifications$.pipe(takeUntil(this.unsubscribe$)).subscribe((notifications) => {
      const newNotificationsExist = notifications.total > this.cachedData.length;
      const notificationsWereRemoved = notifications.total < this.cachedData.length;
      if (newNotificationsExist) {
        // notifications are assumed to be received in chronological order
        const newNotificationAmount = notifications.total - this.cachedData.length;
        this.cachedData = arrPushFront(newNotificationAmount, undefined, this.cachedData);

        // shift fetched page numbers forward
        const shiftAmt = this.getPageForIndex(newNotificationAmount - 1);
        this.fetchedPages = new Set([...this.fetchedPages.values()].map((pageNumber) => pageNumber + shiftAmt));
        this.fetchedPages = setFilter(this.fetchedPages, (page) => page <= this.getPageForIndex(notifications.total - 1));
      } else if (notificationsWereRemoved) {
        this.cachedData = new Array(notifications.total).fill(undefined);
        this.lastViewedRange.end = Math.min(this.lastViewedRange.end, notifications.total - 1);
        this.fetchedPages.clear();
      }
      this.fetchedPages.add(notifications.currentPage - 1);
      if (newNotificationsExist || notificationsWereRemoved) {
        this.fetchRange(this.lastViewedRange);
      }
      this.cachedData.splice(
        (notifications.currentPage - 1) * notifications.pageSize,
        notifications.pageSize,
        ...notifications.results
      );
      this.data$.next(this.cachedData);
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<Notification[]> {
    collectionViewer.viewChange.pipe(takeUntil(this.unsubscribe$)).subscribe((range) => {
      const indexRange: ListRange = {...range, end: range.end - 1};
      this.lastViewedRange = indexRange;
      this.fetchRange(indexRange);
    });
    return this.data$.asObservable();
  }

  disconnect(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  removeNotificationFromCache(id: string) {
    this.cachedData[this.cachedData.findIndex((notification) => notification.id === id)] = undefined;
    this.data$.next(this.cachedData);
  }

  removeAllNotificationsFromCache() {
    this.cachedData = this.cachedData.map((notification) => undefined);
    this.data$.next(this.cachedData);
  }

  private getFirstMissingIndexWithin = (range: ListRange) =>
  [...this.cachedData].splice(range.start, range.end).findIndex((d) => !d)
  private getLastMissingIndexWithin = (range: ListRange) =>
  [...this.cachedData].splice(range.start, range.end).reverse().findIndex((d) => !d)

  private fetchRange(range: ListRange) {
    const firstMissingIndex = this.getFirstMissingIndexWithin(range);
    if (firstMissingIndex >= 0) {
      const lastMissingIndex = this.getLastMissingIndexWithin(range);
      const startPage = this.getPageForIndex(range.start + firstMissingIndex);
      const endPage = this.getPageForIndex(range.end - lastMissingIndex);
      this.fetchPages(startPage, endPage);
    }
  }

  private fetchPages(start: number, end: number) {
    for (let i = start; i <= end; i++) {
      if (!this.fetchedPages.has(i)) {
        this.facade.loadNotifications(i);
        this.fetchedPages.add(i);
      }
    }
  }

  private getPageForIndex(index: number): number {
    return Math.ceil((index + 1) / this.facade.pageSize);
  }
}
