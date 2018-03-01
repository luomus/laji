import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: '[laji-line-transect]',
  templateUrl: './line-transect.component.html',
  styleUrls: ['./line-transect.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineTransectComponent implements OnInit, OnDestroy {

  showForm = false;
  showNav = true;
  formData: any;
  routeSub: Subscription;

  constructor(public router: Router) { }

  ngOnInit() {
    this.showForm = !environment.production;
    this.showNav = this.router.url.indexOf('form') === -1;
    this.routeSub = this.router
      .events
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.showNav = event.url.indexOf('form') === -1;
        }
      });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
