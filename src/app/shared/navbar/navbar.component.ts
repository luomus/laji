import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../service/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { NotificationApi } from '../api/NotificationApi';
import { Observable } from 'rxjs/Observable';
import { Notification } from '../model/Notification';
import { PagedResult } from '../model/PagedResult';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { DialogService } from '../service/dialog.service';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.css'],
  templateUrl: './navbar.component.html',
  providers: [NotificationApi],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit, OnDestroy {

  @ViewChild('userMenu') public dropDown: BsDropdownDirective;

  openMenu: Boolean = false;
  isAuthority = false;
  isProd = false;
  isLoggedIn = false;
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
    public userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationApi,
    public translate: TranslateService,
    private dialogService: DialogService
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
      .delay(5000)
      .filter(() => this.userService.isLoggedIn)
      .switchMap(() => Observable.forkJoin(
        this.notificationService.fetch(
          this.userService.getToken(),
          '' + this.currentNotificationPage,
          '' + this.notificationPageSize
        ),
        this.notificationService.fetch(this.userService.getToken(), '1', '1', 'true'),
        (notifications, unseen) => ({...notifications, unseen: unseen.total || 0})
      ))
      .subscribe(
        notifications => {
          this.notifications = notifications;
          this.notificationsNotSeen = notifications.unseen;
          this.changeDetector.markForCheck();
        },
        err => console.log(err)
      );
    let notifications;
    this.sublangChange = this.translate.onLangChange
      .filter(() => !!this.notifications)
      .filter(() => this.userService.isLoggedIn)
      .do(() => notifications = [...this.notifications.results])
      .do(() => this.notifications.results = [])
      .do(() => this.changeDetector.markForCheck())
      .delay(10)
      .subscribe(() => {
        this.notifications.results = notifications;
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
    this.subNotificationPage = this.notificationService.fetch(
      this.userService.getToken(),
      '' + page,
      '' + this.notificationPageSize
    )
      .subscribe(notifications => {
        this.notifications = notifications;
        this.visibleNotificationPage = notifications.currentPage;
        this.changeDetector.markForCheck();
      });
  }

  ngOnDestroy() {
    this.subUser.unsubscribe();
    this.subParams.unsubscribe();
    this.subNotification.unsubscribe();
    this.sublangChange.unsubscribe();
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

  trackNotification(idx, notification) {
    return notification ? notification.id : undefined;
  }

  markAsSeen(notification: Notification) {
    if (notification.seen) {
      return;
    }
    notification.seen = true;
    this.notificationService
      .update(notification, this.userService.getToken())
      .subscribe(() => {
        this.notificationsNotSeen--;
        this.changeDetector.markForCheck();
      }, () => {});
  }

  removeNotification(notification: Notification) {
    this.translate.get('notification.delete')
      .switchMap(msg => this.dialogService.confirm(msg))
      .subscribe(result => {
        this.dropDown.autoClose = false;
        setTimeout(() => {
          this.dropDown.autoClose = true;
        }, 100);
        if (result) {
          if (!notification.seen) {
            this.notificationsNotSeen--;
          }
          this.changeDetector.markForCheck();
          this.notificationService
            .delete(notification.id, this.userService.getToken())
            .switchMap(() => this.notificationService.fetch(
              this.userService.getToken(),
              '' + this.currentNotificationPage,
              '' + this.notificationPageSize
            ))
            .subscribe((notifications) => {
              this.notifications = notifications;
              this.changeDetector.markForCheck();
            }, () => {});
        }
      });
  }
}
