import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { LangSelectComponent } from './lang-select.component'
import { UserService } from "../service/user.service";

@Component({
  selector: 'laji-navbar',
  directives: [ ROUTER_DIRECTIVES, LangSelectComponent ],
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  openMenu:Boolean = false;

  constructor(public userService:UserService) {}

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }
}
