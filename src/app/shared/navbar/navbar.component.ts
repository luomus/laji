import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { USER_LOGOUT_ACTION, UserService } from '../service/user.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {

  openMenu: Boolean = false;
  isAuthority = false;
  isProd = false;

  constructor(
    public userService: UserService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.isProd = environment.production;
    this.isAuthority = environment.forAuthorities;
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
