import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { NavigationEnd, Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../logger/logger.service';
import { LajiApi, LajiApiService } from '../service/laji-api.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'laji-iucn-footer',
  styleUrls: ['./iucn-footer.component.css'],
  templateUrl: './iucn-footer.component.html'
})
export class IucnFooterComponent implements OnInit, OnDestroy {

  private static treeData;

  public onFrontPage = false;
  public onMapPage = false;
  public subRouteEvent: Subscription;
  public subLangChange: Subscription;
  public tree$;
  public columns = [
    'col-sm-offset-1 col-sm-6 col-md-3',
    'col-sm-5 col-md-2',
    'col-sm-offset-1 col-md-offset-0 col-sm-6 col-md-3',
    'col-sm-5 col-md-3'
  ];

  constructor(
    public footerService: FooterService,
    private router: Router,
    private lajiApi: LajiApiService,
    private translate: TranslateService,
    private logger: Logger
  ) {
  }

  ngOnInit() {
    this.tree$ = of(IucnFooterComponent.treeData);
    this.fetchTreeData(false);
    this.subRouteEvent = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.onFrontPage = this.router.isActive('/', true)
          || this.router.isActive('/en', true)
          || this.router.isActive('/sv', true);
      });
    this.subLangChange = this.translate.onLangChange.subscribe(() => {
      this.fetchTreeData();
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

  fetchTreeData(force = true) {
    if (!force && IucnFooterComponent.treeData) {
      return;
    }
    this.lajiApi.get(LajiApi.Endpoints.information, 'index', {lang: this.translate.currentLang}).pipe(
      map(tree => tree.children || [])
    ).subscribe(
        tree => {
          IucnFooterComponent.treeData = tree;
          this.tree$ = of(IucnFooterComponent.treeData);
        },
        err =>  this.logger.error('Failed to fetch information tree', err)
      );
  }
}
