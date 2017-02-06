import { Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  openMenu: Boolean = false;
  isAuthority = false;
  env = 'beta';

  constructor(public userService: UserService, appConfig: AppConfig) {
    this.env = appConfig.getEnv();
    this.isAuthority = appConfig.isForAuthorities();
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }

  clicked(event: Event) {
    event.preventDefault();
    this.userService.doLogin();
  }
}
