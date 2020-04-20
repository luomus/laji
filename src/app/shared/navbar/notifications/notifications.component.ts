import {
  Component, ChangeDetectionStrategy, OnDestroy, OnInit, Input, Output,
  ChangeDetectorRef, Renderer2, ElementRef, AfterViewInit, EventEmitter, ViewChild
} from '@angular/core';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil, filter, tap, map } from 'rxjs/operators';
import { NotificationsFacade } from './notifications.facade';
import { NotificationDataSource } from './notification-data-source';
import { TranslateService } from '@ngx-translate/core';
import { Notification } from '../../model/Notification';
import { DialogService } from 'app/shared/service/dialog.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'laji-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit, OnDestroy, AfterViewInit {
  unsubscribe$ = new Subject<void>();

  notificationSource: NotificationDataSource;

  @Output() close = new EventEmitter<void>();
  @ViewChild(CdkVirtualScrollViewport, {static: true}) virtualScroll: CdkVirtualScrollViewport;
  loading: boolean;

  constructor(
    private notificationsFacade: NotificationsFacade,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private dialogService: DialogService,
    private renderer: Renderer2,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.notificationSource = new NotificationDataSource(this.notificationsFacade, this.virtualScroll);
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

  markAllAsSeen() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.notificationsFacade.markAllAsSeen().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.loading = false;
      this.cdr.markForCheck();
    }, () => this.loading = false);
  }

  removeAll() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.translate.get('notification.deleteAll.confirm').pipe(
      takeUntil(this.unsubscribe$),
      switchMap(msg => this.dialogService.confirm(msg)),
      map((res) => {
        if (!res) {
          throw new Error('cancelled');
        }
        return res;
      }),
      switchMap(() => this.notificationsFacade.removeAll()),
      tap(() => this.notificationSource.removeAllNotificationsFromCache()),
    ).subscribe(() => {
      this.loading = false;
      this.notificationsFacade.loadNotifications(1);
      this.cdr.markForCheck();
    }, () => {
      this.loading = false;
    });
  }

  markAsSeen(notification: Notification) {
    this.notificationsFacade.markAsSeen(notification).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  removeNotification(notification: Notification) {
    this.translate.get('notification.delete.confirm').pipe(
      switchMap(msg => notification.seen ? of(true) : this.dialogService.confirm(msg)),
      filter(result => !!(result && notification.id)),
      tap(() => this.notificationSource.removeNotificationFromCache(notification.id)),
      switchMap(() => this.notificationsFacade.remove(notification))
    ).subscribe(() => {
      this.virtualScroll.checkViewportSize();
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
