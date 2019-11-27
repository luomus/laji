import { filter, switchMap, takeUntil } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { UserService } from '../service/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { TranslateService } from '@ngx-translate/core';
import { timer, Subject } from 'rxjs';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { PagedResult } from '../model/PagedResult';
import { Notification } from '../model/Notification';
import { isPlatformBrowser } from '@angular/common';
import { Global } from '../../../environments/global';
import { NotificationsFacade } from './notifications/notifications.facade';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationsFacade]
})
export class NavbarComponent implements OnInit, OnDestroy {
  unsubscribe$ = new Subject<null>();

  @ViewChild('userMenu', { static: false }) public dropDown: BsDropdownDirective;

  openMenu: Boolean = false;
  redTheme = false;
  isProd = false;
  showSearch = false;
  notificationsNotSeen = 0;
  env = environment.type;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private changeDetector: ChangeDetectorRef,
    public translate: TranslateService,
    private notificationsFacade: NotificationsFacade
  ) {
    this.isProd = environment.production;
    this.redTheme = environment.type === Global.type.vir || environment.type === Global.type.iucn;
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
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
      this.changeDetector.markForCheck();
    });
    this.userService.isLoggedIn$.pipe(
      filter(res => !!res),
      switchMap(() => timer(1000, 60000)),
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.notificationsFacade.loadEmptyPageAndUnseenCount();
      this.changeDetector.markForCheck();
    });
  }

  onClose() {
    this.dropDown.hide();
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
