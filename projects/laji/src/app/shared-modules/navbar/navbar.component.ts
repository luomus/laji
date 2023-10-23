import { filter, switchMap, takeUntil } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { UserService } from '../../shared/service/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { TranslateService } from '@ngx-translate/core';
import { timer, Subject, Observable } from 'rxjs';
import { Global } from '../../../environments/global';
import { NotificationsFacade } from './notifications/notifications.facade';
import { BrowserService } from '../../shared/service/browser.service';
import { PlatformService } from '../../root/platform.service';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationsFacade]
})
export class NavbarComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject<null>();

  openMenu = false;
  redTheme = false;
  devRibbon = false;
  showSearch = false;
  containerClass: string;
  navId: string;

  notificationsNotSeen = 0;
  notificationsTotal$: Observable<number>;

  constructor(
    private platformService: PlatformService,
    public userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    protected changeDetector: ChangeDetectorRef,
    public translate: TranslateService,
    private notificationsFacade: NotificationsFacade,
    private browserService: BrowserService,
    private ngZone: NgZone
  ) {
    this.navId = environment.type + '-nav';
    this.devRibbon = environment.displayDevRibbon || environment.production === false;
    this.redTheme = environment.type === Global.type.vir || environment.type === Global.type.iucn;
    this.containerClass = environment.type === Global.type.iucn ? 'container' : 'container-fluid';
  }

  ngOnInit() {
    if (this.platformService.isServer) {
      return;
    }
    this.router.events.pipe(takeUntil(this.unsubscribe$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeMenu();
        this.changeDetector.markForCheck();
      }
    });
    this.notificationsFacade.unseenCount$.pipe(takeUntil(this.unsubscribe$)).subscribe((unseenCount) => {
      this.notificationsNotSeen = unseenCount;
      this.changeDetector.detectChanges();
    });
    this.notificationsTotal$ = this.notificationsFacade.total$;
    this.ngZone.runOutsideAngular(() => {
      timer(1000, 300000).pipe( // every 5 minutes
        switchMap(() => this.browserService.visibility$),
        filter(visible => visible),
        switchMap(() => this.userService.isLoggedIn$),
        filter(res => !!res),
        takeUntil(this.unsubscribe$)
      ).subscribe(() => {
        this.ngZone.run(() => this.notificationsFacade.checkForNewNotifications());
      });
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  updateView() {
    this.changeDetector.markForCheck();
  }

  toggleMenu() {
    this.openMenu = !this.openMenu;
  }

  closeMenu() {
    this.openMenu = false;
  }

  doLogin(event: Event) {
    event.preventDefault();
    this.userService.redirectToLogin();
    this.closeMenu();
  }

  goToForum(event: Event) {
    event.preventDefault();
    this.closeMenu();
    this.router.navigate(this.localizeRouterService.translateRoute(['/forum']), {skipLocationChange: true});
  }

}
