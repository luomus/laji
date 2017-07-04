import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { AppConfig } from '../../app.config';
import { WindowRef } from '../../shared/windows-ref';
import { LocalizeRouterService } from '../../locale/localize-router.service';

@Component({
  selector: 'laji-logout',
  templateUrl: './user-logout.component.html'
})
export class UserLogoutComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private appConfig: AppConfig,
    private localizeRouterService: LocalizeRouterService,
    private windowRef: WindowRef
  ) {
  }

  ngOnInit() {
    if (this.userService.isLoggedIn) {
      this.userService.logout();
    }
    if (this.appConfig.isForcedLogin()) {
      this.windowRef.nativeWindow.location = this.appConfig.getLoginUrl();
    } else {
      this.router.navigate(this.localizeRouterService.translateRoute(['/']), {queryParams: {}});
    }
  }

}
