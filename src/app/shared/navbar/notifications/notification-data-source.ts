import { DataSource, CollectionViewer, ListRange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationsFacade } from './notifications.facade';
import { Notification } from '../../model/Notification';

const pushFront = <T>(amt: number, arr: Array<T>): T[] => new Array(amt).fill(undefined).concat(arr);

export class NotificationDataSource extends DataSource<Notification> {
  private data$ = new BehaviorSubject<Notification[]>(undefined);
  private cachedData: Notification[] = [];
  private fetchedPages = new Set<number>();

  constructor(private facade: NotificationsFacade) {
    super();
    facade.notifications$.subscribe((notifications) => {
      const newNotificationsExist = notifications.total > this.cachedData.length;
      const notificationsWereRemoved = notifications.total < this.cachedData.length;
      let refetch = new Set<number>();
      if (newNotificationsExist) {
        // notifications are assumed to be received in chronological order
        const newNotificationAmount = notifications.total - this.cachedData.length;
        this.cachedData = pushFront(newNotificationAmount, this.cachedData);

        // shift fetched page numbers forward and refetch new stuff
        const shiftAmt = this.getPageForIndex(newNotificationAmount - 1);
        const remap = Array.from(this.fetchedPages.values()).map((pageNumber) => pageNumber + shiftAmt);
        this.fetchedPages.clear();
        remap.forEach((pageNumber) => this.fetchedPages.add(pageNumber));
        for (let i = 0; i <= shiftAmt; i++) {
          refetch.add(i);
        }
      } else if (notificationsWereRemoved) {
        this.cachedData = new Array(notifications.total).fill(undefined);
        refetch = new Set(this.fetchedPages);
        this.fetchedPages.clear();
      }
      this.fetchedPages.add(notifications.currentPage - 1);
      if (newNotificationsExist || notificationsWereRemoved) {
        this.fetchPages(Math.min(...refetch.values()),
                        Math.min(
                                Math.max(...refetch.values()),
                                this.getPageForIndex(notifications.total - 1)
                        ));
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
    collectionViewer.viewChange.subscribe(range => {
      const firstMissingIndex = this.getFirstMissingIndexWithin(range);
      if (firstMissingIndex >= 0) {
        const lastMissingIndex = this.getLastMissingIndexWithin(range);
        const startPage = this.getPageForIndex(range.start + firstMissingIndex);
        const endPage = this.getPageForIndex(range.end - lastMissingIndex);
        this.fetchPages(startPage, endPage);
      }
    });
    return this.data$;
  }

  disconnect(): void {
  }

  private getFirstMissingIndexWithin = (range: ListRange) =>
  [...this.cachedData].splice(range.start, range.end).findIndex((d) => !d)
  private getLastMissingIndexWithin = (range: ListRange) =>
  [...this.cachedData].splice(range.start, range.end).reverse().findIndex((d) => !d)

  private fetchPages(start: number, end: number) {
    for (let i = start; i <= end; i++) {
      if (!this.fetchedPages.has(i)) {
        this.facade.loadNotifications(i);
        this.fetchedPages.add(i);
      }
    }
  }

  private getPageForIndex(index: number): number {
    return Math.ceil(index / this.facade.pageSize);
  }
}
