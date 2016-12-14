import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { InformationApi } from '../api/InformationApi';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.css'],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy{

  public showPartners = true;
  public subRouteEvent: Subscription;
  public subLangChange: Subscription;
  public tree = [];
  public columns = [
    'col-sm-7 col-md-4',
    'col-sm-5 col-md-2',
    'col-sm-7 col-md-2 col-md-offset-1',
    'col-sm-5 col-md-2 col-md-offset-1'
  ];

  constructor(
    public footerService: FooterService,
    private router: Router,
    private informationApi: InformationApi,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.showPartners = this.router.isActive('/', true);
    this.subRouteEvent = this.router.events.subscribe(() => {
      this.showPartners = this.router.isActive('/', true);
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
    this.informationApi
      .informationIndex(this.translate.currentLang)
      .map(tree => tree.children || [])
      .subscribe(tree => this.tree = tree);
  }
}
