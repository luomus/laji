import { Component, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../service/user.service';
import { FormPermissionService } from '../../+haseka/form-permission/form-permission.service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'laji-document-form-footer',
  templateUrl: './document-form-footer.component.html',
  styleUrls: ['./document-form-footer.component.css']
})
export class DocumentFormFooterComponent {
  @Input() form: any;
  @Input() status = '';
  @Input() restrictSubmitPublic = false
  @Output() onSubmitPublic = new EventEmitter();
  @Output() onSubmitPrivate = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  constructor(
    private  userService: UserService,
    private formPermissionService: FormPermissionService
  ) { }

  show(place: 'save'|'temp'|'cancel') {
    let show: boolean;

    if (!this.form || !this.form.actions) {
      show = true;
    } else {
      show = place in this.form.actions;
    }

    if (this.restrictSubmitPublic && place === 'save' && show === true) {
      return this.userService.getUser().map(user =>
        this.formPermissionService.isAdmin({'id': ''}, user)
      );
    }

    return Observable.of(show);
  }

  buttonLabel(place: 'save'|'temp'|'cancel') {
    if (this.form && this.form.actions && this.form.actions[place]) {
      return this.form.actions[place];
    }
    if (place === 'save') {
      return 'haseka.form.savePublic';
    } else if (place === 'temp') {
      return 'haseka.form.savePrivate';
    }
    return 'haseka.form.back';
  }
}
