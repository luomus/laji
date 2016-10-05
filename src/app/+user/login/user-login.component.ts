import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Location } from '@angular/common';
import { URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-user-login',
  templateUrl: 'user-login.component.html'
})
export class UserLoginComponent implements OnInit {

  constructor(private router: Router,
              private userService: UserService,
              private location: Location) {
  }

  ngOnInit() {
    let url = new URLSearchParams(this.location.path(true).replace('?', '?skip=true&'));
    this.location.replaceState('/', '');
    this.userService.login(url.get('token'));
    this.router.navigate(['/'], {
      queryParams: {}
    });
  }
}
