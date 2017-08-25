import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit,
  Output
} from '@angular/core';
import { Notification } from '../../model/Notification';
import { IdService } from '../../service/id.service';

@Component({
  selector: '[laji-notification]',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit {

  targetPath: string;
  targetQuery: any;
  info: string;

  @Input() notification: Notification;
  @Output() removeNotification = new EventEmitter<Notification>();
  @Output() notificationSeen = new EventEmitter<Notification>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initTargets();
  }

  initTargets() {
    if (this.notification.annotation) {
      const annotation = this.notification.annotation;
      this.targetPath = '/view';
      this.info = IdService.getUri(annotation.rootID);
      this.targetQuery = {
        uri: IdService.getUri(annotation.rootID),
        highlight: IdService.getUri(annotation.targetID),
        own: 'true'
      };
      this.changeDetectorRef.markForCheck();
    }
  }

  onRemove(notification) {
    this.removeNotification.emit(notification);
  }

}
