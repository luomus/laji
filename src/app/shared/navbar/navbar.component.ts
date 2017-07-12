import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { UserService } from '../service/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { TranslateService } from '@ngx-translate/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { NotificationApi } from '../api/NotificationApi';
import { Observable } from 'rxjs/Observable';
import { Notification } from '../model/Notification';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html',
  providers: [NotificationApi],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy{

  openMenu: Boolean = false;
  isAuthority = false;
  isProd = false;
  isLoggedIn = false;
  showSearch = false;
  notifications: Notification[] = [];

  private subParams: Subscription;
  private subUser: Subscription;
  private subNotification: Subscription;

  constructor(
    public userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationApi,
    public translate: TranslateService
  ) {
    this.isProd = environment.production;
    this.isAuthority = environment.forAuthorities;
  }

  ngOnInit() {
    this.subUser = this.userService.action$
      .debounceTime(50)
      .subscribe(() => {
        this.isLoggedIn = this.userService.isLoggedIn;
        this.changeDetector.markForCheck();
      });
    this.subParams = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSearch = ['/', '/sv', '/en'].indexOf(event.urlAfterRedirects) === -1;
        this.changeDetector.markForCheck();
      }
    });
    this.subNotification = Observable
      .interval(60000)
      .startWith(0)
      .switchMap(() => this.notificationService.fetch(this.userService.getToken()))
      .subscribe(
        notifications => {
          this.notifications = notifications;
          this.changeDetector.markForCheck();
        },
        err => console.log(err)
      );
  }

  ngOnDestroy() {
    this.subUser.unsubscribe();
    this.subParams.unsubscribe();
    this.subNotification.unsubscribe();
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
}
