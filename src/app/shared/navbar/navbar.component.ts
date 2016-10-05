import { Component } from '@angular/core';
import { UserService } from '../service/user.service';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  openMenu: Boolean = false;

  constructor(public userService: UserService) {
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }
}
