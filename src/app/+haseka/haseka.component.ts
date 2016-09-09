import { Component } from '@angular/core';
import {UserService} from "../shared/service/user.service";
import {FormApi} from "../shared/api/FormApi";
import {DocumentApi} from "../shared/api/DocumentApi";

@Component({
  selector:'laji-haseka',
  templateUrl: './haseka.component.html',
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
