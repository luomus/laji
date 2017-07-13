import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Notification } from '../../model/Notification';
import { AnnotationApi } from '../../api/AnnotationApi';
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

  constructor(
    private annotationApi: AnnotationApi,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.initTargets();
  }

  initTargets() {
    if (this.notification.annotationID) {
      this.annotationApi.findAnnotationById(this.notification.annotationID)
        .subscribe(annotation => {
          this.info = annotation.rootID;
          this.targetPath = '/view';
          this.targetQuery = {
            uri: IdService.getUri(annotation.rootID),
            highlight: IdService.getUri(annotation.targetID)
          }
          this.changeDetectorRef.markForCheck();
        },
        err => console.log(err));
    }
  }

}
