import {
  Component, ChangeDetectionStrategy, OnDestroy, OnInit, Input, Output,
  ChangeDetectorRef, Renderer2, ElementRef, AfterViewInit, EventEmitter
} from '@angular/core';
import { PagedResult } from 'app/shared/model/PagedResult';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil, filter } from 'rxjs/operators';
import { NotificationsFacade } from './notifications.facade';
import { NotificationDataSource } from './notification-data-source';
import { TranslateService } from '@ngx-translate/core';
import { Notification } from '../../model/Notification';
import { DialogService } from 'app/shared/service/dialog.service';

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
    this.notificationSource = new NotificationDataSource(this.notificationsFacade, this.pageSize);
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
