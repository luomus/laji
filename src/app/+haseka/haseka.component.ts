import { Component } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';
import { FormService } from './form/form.service';
import { ToastsService } from '../shared/service/toasts.service';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css'],
  providers: [FormApi, DocumentApi]
})
export class HasekaComponent {

  public email: string;

  constructor(
    public userService: UserService,
    private formService: FormService,
    private toastsService: ToastsService
  ) {
  }

  ngOnInit() {
    let success = this.formService.getSuccessMessage();
    if (success) {
      this.toastsService.showSuccess(success);
    }
  }
}
