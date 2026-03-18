import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BreadcrumbService, IBreadcrumb } from './core/breadcrumb.service';
import { HeaderService } from '../../../laji/src/app/shared/service/header.service';
import { PopstateService } from './core/popstate.service';
import { FooterService } from './core/footer.service';
import { tap } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api';

type News = components['schemas']['NewsPagedDto'];

@Component({
    selector: 'ba-app',
    template: `
    <ba-navbar></ba-navbar>
    <div class="main-view">
      @if (breadcrumbs$ | async; as breadcrumbs) {
        @if (breadcrumbs.length > 0) {
          <div class="container">
            <ol class="breadcrumb">
              @for (b of breadcrumbs; track trackBy($index, b); let last = $last) {
                <li [ngClass]="{active: last}">
                  @if (!last) {
                    <a [routerLink]="b.link">{{ b.name ?? b.translateId | translate }}</a>
                  }
                  @if (last) {
                    {{ b.name ?? b.translateId | translate }}
                  }
                </li>
              }
            </ol>
          </div>
        }
      }
      <laji-technical-news-dumb [news]="news$ | async" [absoluteLink]="'http://laji.fi/'" class="container"></laji-technical-news-dumb>
      <router-outlet></router-outlet>
    </div>
    <ba-footer [displayFull]="(showFooter$ | async) ?? false"></ba-footer>
    `,
    styleUrls: [
        './app.component.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AppComponent {
  breadcrumbs$: Observable<IBreadcrumb[]> = this.breadcrumbs.breadcrumbs$;
  news$: Observable<News> = this.api.get('/news', { query: { tag: 'technical', pageSize: 5 } });
  showFooter$ = this.footerService.show$.pipe(tap(() => { setTimeout(() => { this.cdr.markForCheck(); }); }));

  constructor(
    private breadcrumbs: BreadcrumbService,
    private headerService: HeaderService,
    private api: LajiApiClientBService,
    private footerService: FooterService,
    private cdr: ChangeDetectorRef,
    popstateService: PopstateService // has to be injected for the service to initialize
  ) {
    this.headerService.initialize();
  }

  trackBy(idx: number, item: IBreadcrumb) {
    return item.translateId + item.name;
  }
}
