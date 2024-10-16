import { switchMap, take } from 'rxjs/operators';
import { Component, Input, ViewChild, TemplateRef } from '@angular/core';
import { UserService } from '../service/user.service';
import { SessionStorage } from 'ngx-webstorage';
import { ToastsService } from '../service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { LajiApi, LajiApiService } from '../service/laji-api.service';
import { of } from 'rxjs';
import { Person } from '../model/Person';
import { PlatformService } from '../../root/platform.service';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';

@Component({
  selector: 'laji-feedback',
  styleUrls: ['./feedback.component.scss'],
  templateUrl: './feedback.component.html'
})
export class FeedbackComponent {

  @Input() iconOnly = false;
  @Input() fixed = true;

  @SessionStorage() public feedback: IFeedback = {
    subject: '',
    other: '',
    message: '',
    meta: '',
    email: ''
  };
  public error = false;
  private displayedModal!: ModalRef;

  @ViewChild('childModal', { static: true }) public modal!: TemplateRef<any>;

  constructor(
		private platformService: PlatformService,
    public userService: UserService,
    public translate: TranslateService,
    private lajiApi: LajiApiService,
    private toastsService: ToastsService,
    private location: Location,
    private modalService: ModalService
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

    (!this.userService.getToken() ?
      of(undefined) :
      this.userService.user$).pipe(
        take(1)
    ).pipe(
      switchMap((user: Person | undefined | null) => this.lajiApi.post(
        LajiApi.Endpoints.feedback,
        {
          subject,
          message: this.feedback.message + '\n\n---\n' + this.feedback.email,
          meta
        },
        {personToken: user && user.emailAddress ? this.userService.getToken() : undefined as any}
      ))
    ).subscribe({
      next: () => {
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
      error: () => {
        this.sendMessage('showError', 'feedback.failure');
      }
    });
  }

  private getMeta(): string {
    let agent = '';
    try {
      agent = this.platformService.window.navigator.userAgent;
    } catch (e) {
    }
    return this.location.prepareExternalUrl(this.location.path())
      + '\n' + agent;
  }

  private sendMessage(type: string, msgKey: string | string[]) {
    this.translate.get(msgKey)
      .subscribe((msg) => {
        (this.toastsService as any)[type](msg);
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
