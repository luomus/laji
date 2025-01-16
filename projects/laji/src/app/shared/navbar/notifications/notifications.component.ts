import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil, filter, tap, map } from 'rxjs/operators';
import { NotificationsFacade } from './notifications.facade';
import { NotificationDataSource } from './notification-data-source';
import { TranslateService } from '@ngx-translate/core';
import { Notification } from '../../model/Notification';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DialogService } from '../../service/dialog.service';

@Component({
  selector: 'laji-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject<void>();

  notificationSource!: NotificationDataSource;

  @ViewChild(CdkVirtualScrollViewport, {static: true}) virtualScroll!: CdkVirtualScrollViewport;
  loading = true;

  constructor(
    private notificationsFacade: NotificationsFacade,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
    this.notificationSource = new NotificationDataSource(this.notificationsFacade, this.virtualScroll, this.cdr);
    this.notificationsFacade.loading$.pipe(takeUntil(this.unsubscribe$)).subscribe(loading => {
      this.loading = loading;
      this.cdr.markForCheck();
    });
  }

  markAllAsSeen() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.notificationsFacade.markAllAsSeen();
  }

  removeAll() {
    if (this.loading) {
      return;
    }
    this.translate.get('notification.deleteAll.confirm').pipe(
      takeUntil(this.unsubscribe$),
      switchMap(translation => this.dialogService.confirm(translation)),
      map((res) => {
        if (!res) {
          throw new Error('cancelled');
        }
        return res;
      }),
      tap(() => this.notificationsFacade.removeAll()),
      tap(() => this.notificationSource.removeAllNotificationsFromCache()),
    ).subscribe();
  }

  markAsSeen(notification: Notification) {
    this.notificationsFacade.markAsSeen(notification);
  }

  removeNotification(notification: Notification) {
    this.translate.get('notification.delete.confirm').pipe(
      switchMap(translation => notification.seen ? of(true) : this.dialogService.confirm(translation)),
      filter(result => !!(result && notification.id)),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      tap(() => this.notificationSource.removeNotificationFromCache(notification.id!)),
      tap(() => this.notificationsFacade.remove(notification))
    ).subscribe();
}

  trackNotification(idx: number, notification?: Notification) {
    return notification ? notification.id : undefined;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
