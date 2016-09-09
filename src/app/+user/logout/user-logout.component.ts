import { Component, OnInit } from '@angular/core';
import {UserService} from "../../shared/service/user.service";

@Component({
    selector: 'laji-logout',
    templateUrl: 'user-logout.component.html'
})
export class UserLogoutComponent implements OnInit {
    constructor(private userService:UserService) { }

    ngOnInit() {
      if (this.userService.isLoggedIn()) {
        this.userService.logout();
      }
    }

}
