import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../logger/logger.service';
import { LajiApi, LajiApiService } from '../service/laji-api.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.css'],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy {

  private static treeData;

  @Input() onFrontPage = false;

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
    this.tree$ = of(FooterComponent.treeData);
    this.fetchTreeData(false);
    this.subLangChange = this.translate.onLangChange.subscribe(() => {
      this.fetchTreeData();
    });
  }

  ngOnDestroy() {
    if (this.subLangChange) {
      this.subLangChange.unsubscribe();
    }
  }

  fetchTreeData(force = true) {
    if (!force && FooterComponent.treeData) {
      return;
    }
    this.lajiApi.get(LajiApi.Endpoints.information, 'index', {lang: this.translate.currentLang}).pipe(
      map(tree => tree.children || [])
    ).subscribe(
        tree => {
          FooterComponent.treeData = tree;
          this.tree$ = of(FooterComponent.treeData);
        },
        err =>  this.logger.error('Failed to fetch information tree', err)
      );
  }
}
