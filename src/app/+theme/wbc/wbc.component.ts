/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: '[laji-wbc]',
  templateUrl: './wbc.component.html',
  styleUrls: ['./wbc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WbcComponent implements OnInit, OnDestroy {

  showForm =  false;
  showNav = true;
  routeSub: Subscription;
  showStatsLinks = false;

  constructor(public router: Router) {}

  ngOnInit() {
    this.showForm = !environment.production;
    this.showNav = this.router.url.indexOf('form') === -1;
    this.showStatsLinks = this.router.url.indexOf('stats') !== -1;
    this.routeSub = this.router.events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showNav = event.url.indexOf('form') === -1;
          this.showStatsLinks = event.url.indexOf('stats') !== -1;
        }
      });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
