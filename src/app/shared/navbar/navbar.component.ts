import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { USER_LOGOUT_ACTION, UserService } from '../service/user.service';
import { AppConfig } from '../../app.config';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {

  openMenu: Boolean = false;
  isAuthority = false;
  env = 'beta';

  constructor(
    public userService: UserService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    appConfig: AppConfig
  ) {
    this.env = appConfig.getEnv();
    this.isAuthority = appConfig.isForAuthorities();
    this.userService.action$.subscribe((action) => {
      if (action === USER_LOGOUT_ACTION) {
        this.changeDetector.markForCheck();
      }
    });
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
