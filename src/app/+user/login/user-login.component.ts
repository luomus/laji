import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { isPlatformBrowser, Location } from '@angular/common';
import { URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-user-login',
  templateUrl: './user-login.component.html'
})
export class UserLoginComponent implements OnInit {

  constructor(private router: Router,
              private userService: UserService,
              private location: Location,
              @Inject(PLATFORM_ID) private platformId: object
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const url = new URLSearchParams(this.location.path(true).replace('?', '?skip=true&'));
      this.location.replaceState('/', '');
      this.userService.login(url.get('token'));
      this.userService.returnToPageBeforeLogin();
    }
  }
}
