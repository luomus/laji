import {
  Component, ChangeDetectionStrategy, OnDestroy, OnInit, Input, Output,
  ChangeDetectorRef, Renderer2, ElementRef, AfterViewInit, EventEmitter
} from '@angular/core';
import { PagedResult } from 'app/shared/model/PagedResult';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NotificationsFacade } from './notifications.facade';
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
  @Input() notifications: PagedResult<Notification>;
  @Input() pageSize = 5;

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

  markAsSeen(notification: Notification) {
    this.notificationsFacade.markAsSeen(notification).subscribe(() => this.cdr.markForCheck());
  }

  removeNotification(notification: Notification) {
    this.translate.get('notification.delete').pipe(
      switchMap(msg => notification.seen ? of(true) : this.dialogService.confirm(msg))
    ).subscribe(result => {
      if (result && notification.id) {
        this.notificationsFacade.remove(notification).subscribe(() => this.cdr.markForCheck());
      }
    });
  }

  trackNotification(idx, notification) {
    return notification ? notification.id : undefined;
  }

  ngOnDestroy(): void {
  }
}
