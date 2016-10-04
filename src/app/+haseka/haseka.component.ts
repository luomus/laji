import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from 'ng2-translate/ng2-translate';

import {InformationApi, Information} from "../shared";
import {UserService} from "../shared/service/user.service";
import {FormApi} from "../shared/api/FormApi";
import {DocumentApi} from "../shared/api/DocumentApi";

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css'],
  providers: [ FormApi, DocumentApi ]
})
export class HasekaComponent {

  public email: string;

  constructor(
    public userService:UserService,
    private formService:FormApi
  ) {}

  ngOnInit() {
  }
}
