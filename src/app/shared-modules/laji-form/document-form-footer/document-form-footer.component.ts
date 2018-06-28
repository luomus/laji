import {Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { UserService } from '../../../shared/service/user.service';
import { FormPermissionService } from '../../../+haseka/form-permission/form-permission.service';

@Component({
  selector: 'laji-document-form-footer',
  templateUrl: './document-form-footer.component.html',
  styleUrls: ['./document-form-footer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormFooterComponent {
  @Input() status = '';
  @Input() saving = false;
  @Input() restrictSubmitPublic = false;
  @Output() onSubmitPublic = new EventEmitter();
  @Output() onSubmitPrivate = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  _form: any
  show = {
    save: false,
    temp: false,
    cancel: false
  };

  constructor(
    private  userService: UserService,
    private formPermissionService: FormPermissionService,
    private cdr: ChangeDetectorRef
  ) { }

  @Input()
  set form(form: any) {
    this._form = form;
    ['save', 'temp', 'cancel'].forEach(place => {
      let show: boolean;

      if (!form || !form.actions) {
        show = true;
      } else {
        show = place in form.actions;
      }
      this.show[place] = show;
    });

    if (this.restrictSubmitPublic && this.show.save === true) {
      this.show.save = false;
      this.userService.getUser().map(user =>
        this.formPermissionService.isAdmin({'id': ''}, user)
      ).subscribe(showSave => {
        this.show.save = showSave;
        this.cdr.markForCheck();
      })
    }
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
