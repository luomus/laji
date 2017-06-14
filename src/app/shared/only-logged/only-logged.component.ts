import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';

@Component({
  selector: 'only-logged',
  templateUrl: './only-logged.component.html'
})
export class OnlyLoggedComponent implements OnInit {
  public isLoggedIn = false;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.isLoggedIn = this.userService.isLoggedIn;
  }
}
