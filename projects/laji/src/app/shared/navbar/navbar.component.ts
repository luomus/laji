import { debounceTime, distinctUntilChanged, filter, switchMap, takeUntil } from 'rxjs/operators';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef, HostListener, NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { UserService } from '../service/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { TranslateService } from '@ngx-translate/core';
import { timer, Subject, Observable, fromEvent } from 'rxjs';
import { Global } from '../../../environments/global';
import { NotificationsFacade } from './notifications/notifications.facade';
import { BrowserService } from '../service/browser.service';
import { PlatformService } from '../../root/platform.service';

@Component({
  selector: 'laji-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [NotificationsFacade]
})
export class NavbarComponent implements AfterViewInit, OnInit, OnDestroy {
  unsubscribe$ = new Subject<null>();

  mobile = false;
  openMenu = false;
  redTheme = false;
  devRibbon = false;
  showSearch = false;
  containerClass: string;
  navId: string;

  notificationsNotSeen = 0;
  notificationsTotal$!: Observable<number>;

  constructor(
    private cdr: ChangeDetectorRef,
    private platformService: PlatformService,
    public userService: UserService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    protected changeDetector: ChangeDetectorRef,
    public translate: TranslateService,
    private notificationsFacade: NotificationsFacade,
    private browserService: BrowserService,
    private ngZone: NgZone,
    private elementRef: ElementRef
  ) {
    this.navId = environment.type + '-nav';
    this.devRibbon = environment.displayDevRibbon || environment.production === false;
    this.redTheme = environment.type === Global.type.vir || environment.type === Global.type.iucn;
    this.containerClass = environment.type === Global.type.iucn ? 'container' : 'container-fluid';
  }

  @HostListener('document:click', ['$event'])
  click(event: any) {
    if (this.openMenu && !this.elementRef.nativeElement.contains(event.target)) {
      this.toggleMenu();
    }
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

  ngAfterViewInit() {
    this.checkScreenWidth();
    this.cdr.detectChanges();
    fromEvent(this.platformService.window, 'resize').pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$)
    ).subscribe(this.checkScreenWidth.bind(this));
  }

  checkScreenWidth(event?: any) {
    const isMobile = this.platformService.window.innerWidth < 900;
    this.mobile = isMobile;
    this.cdr.detectChanges();
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

  scroll(target: HTMLElement) {
    if (this.mobile) {
      target.scrollIntoView({behavior: 'smooth'});
    }
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
