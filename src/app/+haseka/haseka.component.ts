import { Component } from '@angular/core';
import {HaSeKaFormComponent} from "./form/haseka-form.component";
import {UserService} from "../shared/service/user.service";
import {FormApi} from "../shared/api/FormApi";
import {HaSeKaFormListComponent} from "./form-list/haseka-form-list";

@Component({
  selector:'laji-haseka',
  templateUrl: './haseka.component.html',
  directives: [ HaSeKaFormComponent, HaSeKaFormListComponent ],
  providers: [ UserService, FormApi ]
})
export class HaSeKaComponent {

  public email: string;

  constructor(
    public userService:UserService,
    private formService:FormApi
  ) {}

}
