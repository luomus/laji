import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-logout',
  templateUrl: 'user-logout.component.html'
})
export class UserLogoutComponent implements OnInit {
  constructor(private userService: UserService, private router: Router) {
  }

  ngOnInit() {
    if (this.userService.isLoggedIn()) {
      this.userService.logout();
    }
    this.router.navigate(['/'], {
      queryParams: {}
    });
  }

}
