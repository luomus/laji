import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { environment } from '../../../environments/environment';
import { take } from 'rxjs/operators';

@Component({
  selector: 'laji-logout',
  templateUrl: './user-logout.component.html'
})
export class UserLogoutComponent implements OnInit {
  constructor(@Inject(WINDOW) private window: Window,
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
        this.userService.logout();
      }
    });
    if (environment.forceLogin) {
      this.window.location.href = UserService.getLoginUrl();
    } else {
      this.router.navigate(this.localizeRouterService.translateRoute(['/']), {queryParams: {}});
    }
  }

}
