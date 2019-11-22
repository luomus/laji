import {
  Component, ChangeDetectionStrategy, OnDestroy, OnInit, Input, Output,
  ChangeDetectorRef, Renderer2, ElementRef, AfterViewInit, EventEmitter
} from '@angular/core';
import { PagedResult } from 'app/shared/model/PagedResult';
import { of, Subject, Observable, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, takeUntil, filter } from 'rxjs/operators';
import { NotificationsFacade } from './notifications.facade';
import { TranslateService } from '@ngx-translate/core';
import { Notification } from '../../model/Notification';
import { DialogService } from 'app/shared/service/dialog.service';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

@Component({
  selector: 'laji-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit, OnDestroy, AfterViewInit {
  unsubscribe$ = new Subject<void>();

  @Input() notifications: PagedResult<Notification>;
  @Input() pageSize = 5;

  notificationSource: NotificationDataSource;

  @Output() close = new EventEmitter<void>();

  constructor(
    private notificationsFacade: NotificationsFacade,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private dialogService: DialogService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.notificationSource = new NotificationDataSource(this.notificationsFacade);
    this.notificationsFacade.notifications$.pipe(takeUntil(this.unsubscribe$)).subscribe(notifications => {
      this.notificationSource.receivePage(notifications);
    });
  }

  ngAfterViewInit() {
    // Stop dropdown from closing when notifications are clicked
    this.renderer.listen(this.elementRef.nativeElement, 'click', (e) => {
      e.stopPropagation();
    });
  }

  onClose() {
    this.close.emit();
  }

  nextNotificationPage() {
    this.gotoNotificationPage(this.notifications.currentPage + 1);
  }

  prevNotificationPage() {
    this.gotoNotificationPage(this.notifications.currentPage - 1);
  }

  private gotoNotificationPage(page) {
    if (this.notifications.currentPage !== page) {
      this.notificationsFacade.loadNotifications(page, this.pageSize);
    }
  }

  markAllAsSeen() {
    this.notificationsFacade.markAllAsSeen().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.notificationsFacade.loadNotifications(this.notifications.currentPage, this.pageSize);
      this.cdr.markForCheck();
    });
  }

  removeAll() {
    this.translate.get('notification.delete').pipe(
      takeUntil(this.unsubscribe$),
      switchMap(msg => this.dialogService.confirm(msg)),
      switchMap(res => res ? this.notificationsFacade.removeAll() : of(true))
    ).subscribe(() => {
      this.notificationsFacade.loadNotifications(0, this.pageSize);
      this.cdr.markForCheck();
    });
  }

  markAsSeen(notification: Notification) {
    this.notificationsFacade.markAsSeen(notification).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  removeNotification(notification: Notification) {
    this.translate.get('notification.delete').pipe(
      switchMap(msg => notification.seen ? of(true) : this.dialogService.confirm(msg)),
      filter(result => !!(result && notification.id)),
      switchMap(() => this.notificationsFacade.remove(notification))
    ).subscribe(result => {
      this.cdr.markForCheck();
    });
  }

  trackNotification(idx, notification) {
    return notification ? notification.id : undefined;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

// tslint:disable-next-line:max-classes-per-file
export class NotificationDataSource extends DataSource<Notification> {
  private pageSize = 5;
  private cachedData = [];
  private fetchedPages = new Set<number>();
  private dataStream = new BehaviorSubject<Notification[]>(this.cachedData);
  private subscription = new Subscription();

  constructor(private facade: NotificationsFacade) { super(); }

  connect(collectionViewer: CollectionViewer): Observable<Notification[]> {
    this.subscription.add(collectionViewer.viewChange.subscribe(range => {
      const startPage = this.getPageForIndex(range.start);
      const endPage = this.getPageForIndex(range.end - 1);
      for (let i = startPage; i <= endPage; i++) {
        this.fetchPage(i);
      }
    }));
    return this.dataStream;
  }

  disconnect(): void {
    this.subscription.unsubscribe();
  }

  private getPageForIndex(index: number): number {
    return Math.floor(index / this.pageSize);
  }

  private fetchPage(page: number) {
    if (this.fetchedPages.has(page)) {
      return;
    }
    this.fetchedPages.add(page);

    this.facade.loadNotifications(page, this.pageSize);
  }

  receivePage(notifications: PagedResult<Notification>) {
    if (this.cachedData.length === 0) {
      console.log('len is 0');
      this.cachedData = new Array(notifications.total);
    }
    console.log(this.cachedData);
    this.cachedData.splice(
      notifications.currentPage * this.pageSize,
      this.pageSize,
      ...notifications.results);
    console.log(this.cachedData);
    this.dataStream.next(this.cachedData);
  }
}
