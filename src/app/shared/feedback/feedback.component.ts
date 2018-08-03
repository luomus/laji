import { WINDOW } from '@ng-toolkit/universal';
import { Component, Input, ViewChild , Inject} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
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

  @ViewChild('childModal') public modal: ModalDirective;

  constructor(@Inject(WINDOW) private window: Window,
    public userService: UserService,
    public translate: TranslateService,
    private lajiApi: LajiApiService,
    private toastsService: ToastsService,
    private location: Location
) {
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
    this.userService.getUser()
      .switchMap(user => this.lajiApi.post(
        LajiApi.Endpoints.feedback,
        {
          subject,
          message: !!user ? this.feedback.message : this.feedback.message + '\n\n---\n' + this.feedback.email,
          meta
        },
        {personToken: user && user.emailAddress ? this.userService.getToken() : undefined})
      )
      .subscribe(
        () => {
          this.feedback = {
            subject: '',
            other: '',
            message: '',
            meta: '',
            email: ''
          };
          this.modal.hide();
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
