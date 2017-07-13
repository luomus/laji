import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { WindowRef } from '../../shared/windows-ref';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'laji-logout',
  templateUrl: './user-logout.component.html'
})
export class UserLogoutComponent implements OnInit {
  constructor(
    private userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private windowRef: WindowRef
  ) {
  }

  ngOnInit() {
    if (this.userService.isLoggedIn) {
      this.userService.logout();
    }
    if (environment.forceLogin) {
      this.windowRef.nativeWindow.location = UserService.getLoginUrl();
    } else {
      this.router.navigate(this.localizeRouterService.translateRoute(['/']), {queryParams: {}});
    }
  }

}
