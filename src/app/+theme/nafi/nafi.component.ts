/* tslint:disable:component-selector */
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: '[laji-nafi]',
  templateUrl: './nafi.component.html',
  styleUrls: ['./nafi.component.css']
})
export class NafiComponent implements OnInit {

  formID = environment.nafiForm;

  constructor(
    public userService: UserService
  ) { }

  ngOnInit() {
  }
}
