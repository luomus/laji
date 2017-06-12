import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { AppConfig } from '../../app.config';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  openMenu: Boolean = false;
  isAuthority = false;
  env = 'beta';

  constructor(public userService: UserService, private router: Router, appConfig: AppConfig) {
    this.env = appConfig.getEnv();
    this.isAuthority = appConfig.isForAuthorities();
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }

  doLogin(event: Event) {
    event.preventDefault();
    this.userService.doLogin();
  }

  goToForum(event: Event) {
    event.preventDefault();
    this.router.navigate(['/forum'], {skipLocationChange: true});
  }
}
