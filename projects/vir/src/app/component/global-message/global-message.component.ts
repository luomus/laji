import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, HostBinding, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil, switchMap, map, tap } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { LajiApiService, LajiApi } from 'src/app/shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ngx-webstorage';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'vir-global-message',
  templateUrl: './global-message.component.html',
  styleUrls: [
    './global-message.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalMessageComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();

  content: string;

  @LocalStorage('globalMessageClosed', {}) globalMessageClosed;

  constructor(private api: LajiApiService, private router: Router, private cdr: ChangeDetectorRef, private translate: TranslateService) {}

  ngOnInit() {
    this.router.events.pipe(
      takeUntil(this.unsubscribe$),
      filter(event => event instanceof NavigationEnd),
      switchMap((event: NavigationEnd) => {
        const id = environment.globalMessageIds[event.url];
        if (id) {
          return this.api.get(LajiApi.Endpoints.information, id, {lang: this.translate.currentLang}).pipe(
            map(res => res.content)
          );
        } else {
          return of('');
        }
      })
    ).subscribe((str: string) => {
      this.content = str;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isCurrentPageClosed() {
    return this.globalMessageClosed[this.router.url];
  }

  private close() {
    this.globalMessageClosed = {
      ...this.globalMessageClosed, [this.router.url]: true
    };
  }

  private open() {
    this.globalMessageClosed = {
      ...this.globalMessageClosed, [this.router.url]: false
    };
  }

  @HostListener('click')
  private toggle() {
    this.isCurrentPageClosed() ? this.open() : this.close();
  }
}
