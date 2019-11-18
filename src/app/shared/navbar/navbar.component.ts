import { delay, filter, map, startWith, switchMap, take, tap } from 'rxjs/operators';
import {
  ApplicationRef,
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
import { interval as ObservableInterval, of as ObservableOf, Subscription, timer } from 'rxjs';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { DialogService } from '../service/dialog.service';
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

  @ViewChild('userMenu', { static: false }) public dropDown: BsDropdownDirective;

  openMenu: Boolean = false;
  redTheme = false;
  isProd = false;
  showSearch = false;
  notifications: PagedResult<Notification>;
  notificationsNotSeen = 0;
  notificationPageSize = 5;
  env = environment.type;

  private subParams: Subscription;
  private subUser: Subscription;

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
    this.subParams = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeMenu();
        this.changeDetector.markForCheck();
      }
    });
    this.notificationsFacade.state$.subscribe((state) => {
      this.notifications = state.notifications;
      this.notificationsNotSeen = state.unseenCount;
      this.changeDetector.markForCheck();
    });
    timer(1000, 60000).subscribe(() => {
      this.notificationsFacade.loadAll(0, this.notificationPageSize);
    });
  }

  onClose() {
    this.dropDown.hide();
  }

  ngOnDestroy() {
    if (this.subUser) {
      this.subUser.unsubscribe();
    }
    if (this.subParams) {
      this.subParams.unsubscribe();
    }
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
