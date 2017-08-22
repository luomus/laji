import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit,
  Output
} from '@angular/core';
import { Notification } from '../../model/Notification';
import { AnnotationApi } from '../../api/AnnotationApi';
import { IdService } from '../../service/id.service';
import { DialogService } from '../../service/dialog.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: '[laji-notification]',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit {

  private static cache: {[annoId: string]: {
    info: string;
    targetQuery: any
  }} = {};

  targetPath: string;
  targetQuery: any;
  info: string;

  @Input() notification: Notification;
  @Output() removeNotification = new EventEmitter<Notification>();
  @Output() notificationSeen = new EventEmitter<Notification>();

  constructor(
    private annotationApi: AnnotationApi,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initTargets();
  }

  initTargets() {
    const cache = NotificationComponent.cache;
    if (this.notification.annotationID) {
      this.targetPath = '/view';
      if (cache[this.notification.annotationID]) {
        this.info = cache[this.notification.annotationID].info;
        this.targetQuery = cache[this.notification.annotationID].targetQuery;
      }
      this.annotationApi.findAnnotationById(this.notification.annotationID)
        .subscribe(annotation => {
          this.info = IdService.getUri(annotation.rootID);
          this.targetQuery = {
            uri: IdService.getUri(annotation.rootID),
            highlight: IdService.getUri(annotation.targetID)
          };
          this.changeDetectorRef.markForCheck();
          this.addStateToCache(this.notification.annotationID);
        },
        err => {
          console.log(err);
        });
    }
  }

  addStateToCache(annotationID) {
    NotificationComponent.cache[this.notification.annotationID] = {
      info: this.info,
      targetQuery: this.targetQuery
    };
  }

  onRemove(notification) {
    this.removeNotification.emit(notification);
  }

}
