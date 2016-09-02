import { Component } from '@angular/core';
import {HaSeKaFormComponent} from "./form/haseka-form.component";
import {UserService} from "../shared/service/user.service";
import {FormApi} from "../shared/api/FormApi";
import {HaSeKaFormListComponent} from "./form-list/haseka-form-list";
import {UsersLatestComponent} from "./latest/haseka-users-latest.component";
import {DocumentApi} from "../shared/api/DocumentApi";

@Component({
  selector:'laji-haseka',
  templateUrl: './haseka.component.html',
  directives: [
    HaSeKaFormComponent,
    HaSeKaFormListComponent,
    UsersLatestComponent
  ],
  providers: [ FormApi, DocumentApi ]
})
export class HaSeKaComponent {

  public email: string;

  constructor(
    public userService:UserService,
    private formService:FormApi
  ) {}

  ngOnInit() {

  }

}
