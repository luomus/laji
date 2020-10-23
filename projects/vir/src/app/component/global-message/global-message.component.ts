import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, HostBinding, HostListener, Input, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil, switchMap, map, tap } from 'rxjs/operators';
import { Subject, of, Observable } from 'rxjs';
import { LajiApiService, LajiApi } from 'src/app/shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ngx-webstorage';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'vir-global-message',
  templateUrl: './global-message.component.html',
  styleUrls: [
    './global-message.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalMessageComponent implements OnDestroy, OnInit {
  private unsubscribe$ = new Subject();

  message: any;
  currentMessageId: string;

  @LocalStorage('globalMessageClosed', {}) globalMessageClosed;

  constructor(
    private api: LajiApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.router.events.pipe(
      takeUntil(this.unsubscribe$),
      filter(event => event instanceof NavigationEnd),
      switchMap((event: NavigationEnd) => {
        const idx = Object.keys(environment.globalMessageIds).findIndex(
          key => event.url.match(key)
        );
        const idsWithLang = Object.values(environment.globalMessageIds)[idx];
        this.currentMessageId = idsWithLang[this.translate.currentLang];
        if (this.currentMessageId) {
          return this.api.get(LajiApi.Endpoints.information, this.currentMessageId, {lang: this.translate.currentLang});
        } else {
          return of(undefined);
        }
      })
    ).subscribe((msg: any) => {
      this.message = msg;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isCurrentPageClosed() {
    return this.currentMessageId ? this.globalMessageClosed[this.currentMessageId] : false;
  }

  private close() {
    this.globalMessageClosed = {
      ...this.globalMessageClosed, [this.currentMessageId]: true
    };
  }

  private open() {
    this.globalMessageClosed = {
      ...this.globalMessageClosed, [this.currentMessageId]: false
    };
  }

  @HostListener('click')
  private toggle() {
    this.isCurrentPageClosed() ? this.open() : this.close();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        try {
          window.dispatchEvent(new Event('resize'));
        } catch (e) {
          const evt = window.document.createEvent('UIEvents');
          // @ts-ignore
          evt.initUIEvent('resize', true, false, window, 0);
          window.dispatchEvent(evt);
        }
      });
    }
  }
}
