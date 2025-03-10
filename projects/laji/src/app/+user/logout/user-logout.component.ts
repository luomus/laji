import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'laji-logout',
  templateUrl: './user-logout.component.html'
})
export class UserLogoutComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) {
  }

  ngOnInit() {
    this.userService.isLoggedIn$.pipe(
      take(1)
    ).subscribe(login => {
      if (login) {
        this.userService.logout(() => {
          this.router.navigate(this.localizeRouterService.translateRoute(['/']), {queryParams: {}});
        });
      }
    });
  }

}
