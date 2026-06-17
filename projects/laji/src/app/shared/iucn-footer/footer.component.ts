import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

@Component({
    selector: 'laji-iucn-footer',
    styleUrls: ['./iucn-footer.component.css'],
    templateUrl: './iucn-footer.component.html',
    standalone: false
})
export class IucnFooterComponent implements OnInit, OnDestroy {

  public onFrontPage = false;
  public onMapPage = false;
  public subRouteEvent!: Subscription;
  public subLangChange!: Subscription;
  public columns = [
    'col-sm-offset-1 col-sm-6 col-md-3',
    'col-sm-5 col-md-2',
    'col-sm-offset-1 col-md-offset-0 col-sm-6 col-md-3',
    'col-sm-5 col-md-3'
  ];

  constructor(
    public footerService: FooterService,
    private router: Router,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.subRouteEvent = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.onFrontPage = this.router.isActive('/', true)
          || this.router.isActive('/en', true)
          || this.router.isActive('/sv', true);
      });
  }

  ngOnDestroy() {
    if (this.subRouteEvent) {
      this.subRouteEvent.unsubscribe();
    }
    if (this.subLangChange) {
      this.subLangChange.unsubscribe();
    }
  }

  currentLangIsFinnish() {
    return this.translate.getCurrentLang() === 'fi';
  }
}
