import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BreadcrumbService, IBreadcrumb } from './core/breadcrumb.service';
import { HeaderService } from '../../../laji/src/app/shared/service/header.service';

@Component({
  selector: 'ba-app',
  template: `
    <ba-navbar></ba-navbar>
    <div class="main-view">
      <ng-container *ngIf="breadcrumbs$ | async; let breadcrumbs">
        <div class="container" *ngIf="breadcrumbs.length > 0">
            <ol class="breadcrumb">
              <li *ngFor="let b of breadcrumbs; trackBy: trackBy; let last = last" [ngClass]="{active: last}">
                <a *ngIf="!last" [routerLink]="b.link">{{ b.name ?? b.translateId | translate }}</a>
                <ng-container *ngIf="last">{{ b.name ?? b.translateId | translate }}</ng-container>
              </li>
            </ol>
        </div>
      </ng-container>
      <router-outlet></router-outlet>
    </div>
    <ba-footer></ba-footer>
  `,
  styleUrls: [
    './app.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  breadcrumbs$: Observable<IBreadcrumb[]> = this.breadcrumbs.breadcrumbs$.pipe(tap(() => this.cdr.detectChanges()));

  constructor(
    translate: TranslateService,
    private breadcrumbs: BreadcrumbService,
    private cdr: ChangeDetectorRef,
    private headerService: HeaderService
  ) {
    this.headerService.initialize();
    translate.use('fi');
  }

  trackBy(idx: number, item: IBreadcrumb) {
    return item.translateId + item.name;
  }
}
