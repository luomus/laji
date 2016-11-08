import { Component } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';
import { FormService } from './form/form.service';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css'],
  providers: [FormApi, DocumentApi]
})
export class HasekaComponent {

  public email: string;
  public successMsg;

  constructor(public userService: UserService, private formService: FormService) {
  }

  ngOnInit() {
    this.successMsg = this.formService.getSuccessMessage();
  }
}
