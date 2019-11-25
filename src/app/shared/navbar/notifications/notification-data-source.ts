import { DataSource, CollectionViewer, ListRange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationsFacade } from './notifications.facade';
import { Notification } from '../../model/Notification';

const pushFront = <T>(amt: number, arr: Array<T>): T[] => new Array(amt).fill(undefined).concat(arr);

export class NotificationDataSource extends DataSource<Notification> {
  private data$ = new BehaviorSubject<Notification[]>(undefined);
  private cachedData: Notification[] = [];

  constructor(private facade: NotificationsFacade, private pageSize) {
    super();
    facade.notifications$.subscribe((notifications) => {
      if (notifications.total > this.cachedData.length) {
        // new notifications are added to the front of the list since they are in chronological order
        this.cachedData = pushFront(notifications.total - this.cachedData.length, this.cachedData);
      } else if (notifications.total < this.cachedData.length) {
        this.cachedData = new Array(notifications.total).fill(undefined);
      }
      this.cachedData.splice(
        (notifications.currentPage - 1) * notifications.pageSize,
        notifications.pageSize,
        ...notifications.results
      );
      console.log(this.cachedData);
      this.data$.next(this.cachedData);
    });
  }

  connect(collectionViewer: CollectionViewer): Observable<Notification[]> {
    collectionViewer.viewChange.subscribe(range => {
      console.log(range);
      const firstMissingIndex = this.getFirstMissingIndexWithin(range);
      if (firstMissingIndex >= 0) {
        const lastMissingIndex = this.getLastMissingIndexWithin(range);
        const startPage = this.getPageForIndex(firstMissingIndex);
        const endPage = this.getPageForIndex(lastMissingIndex);
        console.log(startPage, endPage);
        this.fetchPages(startPage, endPage);
      }
    });
    return this.data$;
  }

  disconnect(): void {
  }

  private getFirstMissingIndexWithin(range: ListRange) {
    return range.start + [...this.cachedData].splice(range.start, range.end).findIndex((d) => !d);
/*     for (let i = range.start; i < range.end; i++) {
      if (!this.cachedData[i]) {
        out = range.start + i;
      }
    }
    return out; */
  }

  private getLastMissingIndexWithin(range: ListRange) {
    return range.end - [...this.cachedData].splice(range.start, range.end).reverse().findIndex((d) => !d);
/*     let out = -1;
    for (let i = range.end; i > range.start; i--) {
      if (!this.cachedData[i]) {
        out = range.end - i;
      }
    }
    return out; */
  }

  private fetchPages(start: number, end: number) {
    for (let i = start; i < end; i++) {
      console.log('fetching page ', i);
      this.facade.loadNotifications(i, this.pageSize);
    }
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }
}


/*
cachedData

- initialize with the first page
- if the size changes: shift all elements down by the amount that size was increased (assume)

*/
