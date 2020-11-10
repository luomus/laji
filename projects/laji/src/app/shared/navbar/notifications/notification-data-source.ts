import { DataSource, CollectionViewer, ListRange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NotificationsFacade } from './notifications.facade';
import { Notification } from '../../model/Notification';
import { takeUntil } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

export class NotificationDataSource extends DataSource<Notification> {
  private unsubscribe$ = new Subject<void>();

  private cachedData: Notification[] = [];
  private data$ = new BehaviorSubject<(Notification | undefined)[]>(this.cachedData);
  private fetchedPages = new Set<number>();

  constructor(private facade: NotificationsFacade, private virtualScroll: CdkVirtualScrollViewport) {
    super();
    facade.notifications$.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((notifications) => {
      const newNotificationsExist = notifications.total > this.cachedData.length;
      const notificationsWereRemoved = notifications.total < this.cachedData.length;
      if (newNotificationsExist || notificationsWereRemoved) {
        this.fetchedPages.clear();
        this.fetchedPages.add(notifications.currentPage);
        this.cachedData = new Array(notifications.total).fill(undefined);
        this.fetchRange(virtualScroll.getRenderedRange());
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
      this.fetchRange(range);
    });
    return this.data$.asObservable();
  }

  disconnect(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  removeNotificationFromCache(id: string) {
    this.cachedData = this.cachedData.filter(notification => notification.id !== id);
    this.data$.next(this.cachedData);
  }

  removeAllNotificationsFromCache() {
    this.cachedData = [];
    this.data$.next(this.cachedData);
  }

  private fetchRange(range: ListRange) {
    const pageStart = this.getPageForIndex(range.start);
    const pageEnd = this.getPageForIndex(range.end);
    for (let i = pageStart; i <= pageEnd; i++) {
      this.fetchPages(i);
    }
  }

  private fetchPages(page: number) {
    if (this.fetchedPages.has(page)) {
      return;
    }
    this.fetchedPages.add(page);
    this.facade.loadNotifications(page);
  }

  private getPageForIndex(index: number): number {
    return Math.ceil((index + 1) / this.facade.pageSize);
  }
}
