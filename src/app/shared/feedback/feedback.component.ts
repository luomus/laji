import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';
import { FeedbackApi } from '../api/FeedbackApi';
import { UserService } from '../service/user.service';
import { SessionStorage } from 'angular2-localstorage/dist';
import { ToastsService } from '../service/toasts.service';
import { TranslateService } from 'ng2-translate';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-feedback',
  styleUrls: ['./feedback.component.css'],
  templateUrl: 'feedback.component.html'
})
export class FeedbackComponent {

  @SessionStorage() public feedback: IFeedback = {
    subject: '',
    other: '',
    message: '',
    meta: ''
  };
  public error: boolean = false;

  @ViewChild('childModal') public modal: ModalDirective;

  constructor(
    public userService: UserService,
    private feedbackApi: FeedbackApi,
    private toastsService: ToastsService,
    private translate: TranslateService,
    private location: Location
) {
  }

  closeError() {
    this.error = false;
  }

  sendFeedback() {
    let subject = this.feedback.subject === 'other' ?
      this.feedback.other : this.feedback.subject;
    let message = this.feedback.message;
    if (!subject || !message) {
      this.error = true;
      return;
    }
    let meta = this.location.prepareExternalUrl(location.path());
    this.userService.getUser()
      .subscribe(user => {
        this.feedbackApi.send(
          {subject, message, meta},
          user.emailAddress ? this.userService.getToken() : undefined
        ).subscribe(
          () => {
            this.feedback = {
              subject: '',
              other: '',
              message: '',
              meta: ''
            };
            this.modal.hide();
            this.sendMessage('showSuccess', 'feedback.success');
          },
          () => {
            this.sendMessage('showError', 'feedback.failure');
          }
        );
      });
  }

  private sendMessage(type, msgKey) {
    this.translate.get(msgKey)
      .subscribe((msg) => {
        this.toastsService[type](msg);
      });
  }
}

export interface IFeedback {
  subject: string;
  other: string;
  message: string;
  meta: string;
}
