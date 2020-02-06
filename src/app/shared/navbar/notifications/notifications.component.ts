import {
  Component, ChangeDetectionStrategy, OnDestroy, OnInit, Input, Output,
  ChangeDetectorRef, Renderer2, ElementRef, AfterViewInit, EventEmitter
} from '@angular/core';
import { of, Subject } from 'rxjs';
import { switchMap, takeUntil, filter, tap } from 'rxjs/operators';
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
    this.notificationsFacade.markAllAsSeen().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  removeAll() {
    this.translate.get('notification.delete').pipe(
      takeUntil(this.unsubscribe$),
      switchMap(msg => this.dialogService.confirm(msg)),
      tap(() => this.notificationSource.removeAllNotificationsFromCache()),
      switchMap(res => res ? this.notificationsFacade.removeAll() : of(true))
    ).subscribe(() => {
      this.notificationsFacade.loadNotifications(1);
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
      tap(() => this.notificationSource.removeNotificationFromCache(notification.id)),
      switchMap(() => this.notificationsFacade.remove(notification))
    ).subscribe(() => {
      this.notificationsFacade.loadNotifications(1);
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
