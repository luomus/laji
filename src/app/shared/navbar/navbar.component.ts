import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { TranslateService } from '@ngx-translate/core';

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
  isLoggedIn = false;
  showSearch = false;

  constructor(
    public userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private changeDetector: ChangeDetectorRef,
    public translate: TranslateService
  ) {
    this.isProd = environment.production;
    this.isAuthority = environment.forAuthorities;
    this.userService.action$
      .debounceTime(50)
      .subscribe(() => {
        this.isLoggedIn = this.userService.isLoggedIn;
        this.changeDetector.markForCheck();
      });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSearch = ['/', '/sv', '/en'].indexOf(event.urlAfterRedirects) === -1;
        this.changeDetector.markForCheck();
      }
    });
  }
  updateView() {
    this.changeDetector.markForCheck();
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
    this.router.navigate(this.localizeRouterService.translateRoute(['/forum']), {skipLocationChange: true});
  }

  switchLang(lang) {
    this.translate.use(lang);
    this.router.navigateByUrl(
      this.localizeRouterService.translateRoute(this.localizeRouterService.getPathWithoutLocale(), lang),
      {
        preserveQueryParams: true,
        replaceUrl: true
      });
  }
}
