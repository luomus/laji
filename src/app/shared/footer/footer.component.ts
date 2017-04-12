import { Component, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { InformationApi } from '../api/InformationApi';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.css'],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy{

  public onFrontPage = true;
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
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.onFrontPage = this.router.isActive('/', true);
    this.subRouteEvent = this.router.events.subscribe(() => {
      this.onFrontPage = this.router.isActive('/', true);
    });
    this.fetchTreeData();
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

  fetchTreeData() {
    if (!this.tree) {
      this.informationApi
        .informationIndex(this.translate.currentLang)
        .map(tree => tree.children || [])
        .subscribe(tree => this.tree = tree);
    }
  }
}
