import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { InformationApi } from '../api/InformationApi';
import { TranslateService } from '@ngx-translate/core';
import {Logger} from '../logger/logger.service';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.css'],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy{

  public onFrontPage = false;
  public onMapPage = false;
  public subRouteEvent: Subscription;
  public subLangChange: Subscription;
  public tree;
  public columns = [
    'col-sm-offset-1 col-sm-6 col-md-3',
    'col-sm-5 col-md-2',
    'col-sm-offset-1 col-md-offset-0 col-sm-6 col-md-3',
    'col-sm-5 col-md-3'
  ];

  constructor(
    public footerService: FooterService,
    private router: Router,
    private informationApi: InformationApi,
    private translate: TranslateService,
    private logger: Logger
  ) {
  }

  ngOnInit() {
    this.subRouteEvent = this.router.events
      .startWith(null)
      .subscribe(() => {
        this.onFrontPage = this.router.isActive('/', true)
          || this.router.isActive('/en', true)
          || this.router.isActive('/sv', true);
        this.onMapPage = this.router.isActive('/map', false);
      });
    this.fetchTreeData();
    this.subLangChange = this.translate.onLangChange.subscribe(() => {
      this.fetchTreeData(true);
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

  fetchTreeData(force = false) {
    if (force || !this.tree) {
      this.informationApi
        .informationIndex(this.translate.currentLang)
        .map(tree => tree.children || [])
        .subscribe(
          tree => this.tree = tree,
          err =>  this.logger.error('Failed to fetch information tree', err)
        );
    }
  }
}
