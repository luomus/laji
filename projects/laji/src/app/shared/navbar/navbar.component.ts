import { filter, switchMap, takeUntil } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { UserService } from '../service/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { TranslateService } from '@ngx-translate/core';
import { timer, Subject, Observable } from 'rxjs';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { Global } from '../../../environments/global';
import { NotificationsFacade } from './notifications/notifications.facade';
import { BrowserService } from '../service/browser.service';
import { PlatformService } from '../service/platform.service';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationsFacade]
})
export class NavbarComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject<null>();

  @ViewChild('userMenu') public dropDown: BsDropdownDirective;
  @ViewChild('taxonMenu') private taxonDropdown: BsDropdownDirective;

  openMenu: Boolean = false;
  redTheme = false;
  devRibbon = false;
  showSearch = false;
  env = environment.type;
 
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
    this.devRibbon = !environment.production || environment.type === Global.type.beta;
    this.redTheme = environment.type === Global.type.vir || environment.type === Global.type.iucn;
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
      timer(1000, 60000).pipe(
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

  onClose() {
    this.dropDown.hide();
  }

  onCloseTaxonDropdown() {
    this.taxonDropdown.hide();
    this.changeDetector.markForCheck();
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
