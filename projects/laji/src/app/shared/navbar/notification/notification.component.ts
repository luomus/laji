/* eslint-disable @angular-eslint/component-selector */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { IdService } from '../../service/id.service';
import type { components } from '../../../../../../laji-api-client-b/generated/api';

type Notification = components['schemas']['store-notification'];

@Component({
    selector: '[laji-notification]',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class NotificationComponent {
  targetPath!: string;
  targetQuery: any;
  target!: string | undefined;
  by!: string | undefined;
  type!: 'annotation'|'annotationCommented'|'friendRequest'|'friendRequestAccepted';

  private _notification: Notification | undefined;
  @Input({required: true}) set notification(notification: Notification | undefined) {
    this._notification = notification;
    this.initTargets();
  }
  get notification() {
    return this._notification;
  }
  @Output() removeNotification = new EventEmitter<Notification>();
  @Output() notificationSeen = new EventEmitter<Notification>();

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  initTargets() {
    if (this.notification && this.notification.annotation) {
      this.type = this.notification.notificationReason &&
        this.notification.notificationReason === 'MHN.notificationReasonAnnotatedDocumentAnnotated' ?
        'annotationCommented' : 'annotation';
      const annotation = this.notification.annotation;
      this.targetPath = '/view';
      this.target = IdService.getUri(annotation.rootID);
      this.by = IdService.getId(annotation.annotationByPerson || annotation.annotationBySystem);
      this.targetQuery = {
        uri: IdService.getUri(annotation.rootID),
        highlight: IdService.getUri(annotation.targetID),
        own: this.notification.notificationReason !==  'MHN.notificationReasonAnnotatedDocumentAnnotated',
        openAnnotation: 'true'
      };
    } else if (this.notification && this.notification.friendRequest) {
      this.type = 'friendRequest';
      this.by = IdService.getId(this.notification.friendRequest);
      this.targetPath = '/user/' + this.notification.toPerson;
    } else if (this.notification && this.notification.friendRequestAccepted) {
      this.type = 'friendRequestAccepted';
      this.by = IdService.getId(this.notification.friendRequestAccepted);
      this.targetPath = '/user/' + this.notification.toPerson;
    }
  }

  onRemove(notification: Notification) {
    this.removeNotification.emit(notification);
    this.changeDetectorRef.markForCheck();
  }

}
