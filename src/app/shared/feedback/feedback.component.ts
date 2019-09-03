
import { switchMap, take } from 'rxjs/operators';
import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, Input, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UserService } from '../service/user.service';
import { SessionStorage } from 'ngx-webstorage';
import { ToastsService } from '../service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { LajiApi, LajiApiService } from '../service/laji-api.service';

@Component({
  selector: 'laji-feedback',
  styleUrls: ['./feedback.component.css'],
  templateUrl: './feedback.component.html'
})
export class FeedbackComponent {

  @Input() iconOnly = false;

  @SessionStorage() public feedback: IFeedback = {
    subject: '',
    other: '',
    message: '',
    meta: '',
    email: ''
  };
  public error = false;
  private displayedModal: BsModalRef;

  @ViewChild('childModal', { static: true }) public modal: HTMLElement;

  constructor(@Inject(WINDOW) private window: Window,
    public userService: UserService,
    public translate: TranslateService,
    private lajiApi: LajiApiService,
    private toastsService: ToastsService,
    private location: Location,
    private modalService: BsModalService
) {
  }

  openModal() {
    this.displayedModal = this.modalService.show(this.modal);
  }

  closeModal() {
    this.displayedModal.hide();
  }

  closeError() {
    this.error = false;
  }

  sendFeedback() {
    this.error = false;
    const subject = (['other', ''].indexOf(this.feedback.subject) > -1 ?  '' : (this.feedback.subject + ': ')) + this.feedback.other;
    if (!this.feedback.other || !this.feedback.message) {
      this.error = true;
      return;
    }
    const meta = this.getMeta();
    this.userService.user$.pipe(
      take(1),
      switchMap(user => this.lajiApi.post(
        LajiApi.Endpoints.feedback,
        {
          subject,
          message: this.feedback.message + '\n\n---\n' + this.feedback.email,
          meta
        },
        {personToken: user && user.emailAddress ? this.userService.getToken() : undefined})
      ))
      .subscribe(
        () => {
          this.feedback = {
            subject: '',
            other: '',
            message: '',
            meta: '',
            email: ''
          };
          this.closeModal();
          this.sendMessage('showSuccess', 'feedback.success');
        },
        () => {
          this.sendMessage('showError', 'feedback.failure');
        }
      );
  }

  private getMeta(): string {
    let agent = '';
    try {
      agent = this.window.navigator.userAgent;
    } catch (e) {
    }
    return this.location.prepareExternalUrl(this.location.path())
      + '\n' + agent;
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
  email: string;
  meta: string;
}
