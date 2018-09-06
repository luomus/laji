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
import { interval as ObservableInterval, of as ObservableOf, Subscription } from 'rxjs';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { DialogService } from '../service/dialog.service';
import { LajiApi, LajiApiService } from '../service/laji-api.service';
import { PagedResult } from '../model/PagedResult';
import { Notification } from '../model/Notification';
import { isPlatformBrowser } from '@angular/common';
import { filter, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {

  @ViewChild('userMenu') public dropDown: BsDropdownDirective;

  openMenu: Boolean = false;
  isAuthority = false;
  isProd = false;
  showSearch = false;
  notifications: PagedResult<Notification>;
  notificationsNotSeen = 0;
  currentNotificationPage = 1;
  visibleNotificationPage = 1;
  notificationPageSize = 5;

  private subParams: Subscription;
  private subUser: Subscription;
  private subNotification: Subscription;
  private sublangChange: Subscription;
  private subNotificationPage: Subscription;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private changeDetector: ChangeDetectorRef,
    private lajiApi: LajiApiService,
    public translate: TranslateService,
    private dialogService: DialogService,
    private appRef: ApplicationRef
  ) {
    this.isProd = environment.production;
    this.isAuthority = environment.forAuthorities;
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.subParams = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showSearch = ['/', '/sv', '/en'].indexOf(event.urlAfterRedirects) === -1;
        this.changeDetector.markForCheck();
      }
    });
    this.subNotification = this.appRef.isStable.pipe(
        filter(stable => stable),
        take(1),
        switchMap(() => ObservableInterval(60000)
          .startWith(0)
          .delay(5000)
          .switchMap(() => this.userService.isLoggedIn$.take(1))
          .filter((loggedIn) => loggedIn)
          .switchMap(() => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
              personToken: this.userService.getToken(),
              page: this.currentNotificationPage,
              pageSize: this.notificationPageSize
            })
              .switchMap((notifications) => notifications.total <= this.notificationPageSize ?
                ObservableOf({
                  ...notifications,
                  unseen: notifications.results.reduce((cumulative, current) => cumulative + (current.seen ? 0 : 1), 0)
                }) :
                this.lajiApi.getList(LajiApi.Endpoints.notifications, {
                  personToken: this.userService.getToken(),
                  page: 1,
                  pageSize: 1,
                  onlyUnSeen: true
                })
                  .map(unseen => ({...notifications, unseen: unseen.total || 0}))
              )
          )
        )
    ).subscribe(
        (notifications: any) => {
          this.notifications = notifications;
          this.notificationsNotSeen = notifications.unseen;
          this.changeDetector.markForCheck();
        },
        err => console.log(err)
      );
    let notificationsCache;
    this.sublangChange = this.translate.onLangChange
      .filter(() => !!this.notifications)
      .switchMap(() => this.userService.isLoggedIn$.take(1))
      .filter((loggedIn) => loggedIn)
      .do(() => notificationsCache = [...this.notifications.results])
      .do(() => this.notifications.results = [])
      .do(() => this.changeDetector.markForCheck())
      .delay(10)
      .subscribe(() => {
        this.notifications.results = notificationsCache;
        this.changeDetector.markForCheck();
      });
  }

  nextNotificationPage() {
    this.currentNotificationPage++;
    this.gotoNotificationPage(this.currentNotificationPage);
  }

  prevNotificationPage() {
    this.currentNotificationPage--;
    this.gotoNotificationPage(this.currentNotificationPage);
  }

  private gotoNotificationPage(page) {
    this.dropDown.autoClose = false;
    setTimeout(() => {
      this.dropDown.autoClose = true;
    }, 100);
    if (this.subNotificationPage) {
      this.subNotificationPage.unsubscribe();
    }
    if (this.visibleNotificationPage === page) {
      return;
    }
    this.subNotificationPage = this.lajiApi.getList(LajiApi.Endpoints.notifications, {
      personToken: this.userService.getToken(),
      page: page,
      pageSize: this.notificationPageSize
    })
      .subscribe(notifications => {
        this.notifications = notifications;
        this.visibleNotificationPage = notifications.currentPage;
        this.changeDetector.markForCheck();
      });
  }

  ngOnDestroy() {
    if (this.subUser) {
      this.subUser.unsubscribe();
    }
    if (this.subParams) {
      this.subParams.unsubscribe();
    }
    if (this.subNotification) {
      this.subNotification.unsubscribe();
    }
    if (this.sublangChange) {
      this.sublangChange.unsubscribe();
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
    this.userService.doLogin();
    this.closeMenu();
  }

  goToForum(event: Event) {
    event.preventDefault();
    this.closeMenu();
    this.router.navigate(this.localizeRouterService.translateRoute(['/forum']), {skipLocationChange: true});
  }

  trackNotification(idx, notification) {
    return notification ? notification.id : undefined;
  }

  markAsSeen(notification: Notification) {
    if (notification.seen) {
      return;
    }
    notification.seen = true;
    this.lajiApi
      .update(LajiApi.Endpoints.notifications, notification, {personToken: this.userService.getToken()})
      .subscribe(() => {
        this.notificationsNotSeen--;
        this.changeDetector.markForCheck();
      }, () => {});
  }

  removeNotification(notification: Notification) {
    if (!notification || !notification.id) {
      return;
    }
    this.translate.get('notification.delete')
      .switchMap(msg => notification.seen ? ObservableOf(true) : this.dialogService.confirm(msg))
      .subscribe(result => {
        this.dropDown.autoClose = false;
        setTimeout(() => {
          this.dropDown.autoClose = true;
        }, 100);
        if (result && notification.id) {
          if (!notification.seen) {
            this.notificationsNotSeen--;
          }
          this.changeDetector.markForCheck();
          this.lajiApi
            .remove(LajiApi.Endpoints.notifications, notification.id, {personToken: this.userService.getToken()})
            .switchMap(() => this.lajiApi.getList(LajiApi.Endpoints.notifications, {
              personToken: this.userService.getToken(),
              page: this.currentNotificationPage,
              pageSize: this.notificationPageSize
            }))
            .subscribe((notifications) => {
              this.notifications = notifications;
              this.changeDetector.markForCheck();
            }, () => {});
        }
      });
  }
}
