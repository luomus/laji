import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FooterService } from '../service/footer.service';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../logger/logger.service';
import { LajiApiService } from '../service/laji-api.service';
import { map } from 'rxjs/operators';
import { HeaderImage, HeaderImageService } from '../service/header-image.service';
import { GraphQLDataService } from '../../graph-ql/graph-ql-data.service';

@Component({
  selector: 'laji-footer',
  styleUrls: ['./footer.component.css'],
  templateUrl: './footer.component.html'
})
export class FooterComponent implements OnInit, OnDestroy {

  @Input() onFrontPage = false;

  public subLangChange: Subscription;
  public tree$: Observable<any>;
  public columns = [
    'col-sm-offset-1 col-sm-6 col-md-3',
    'col-sm-5 col-md-2',
    'col-sm-offset-1 col-md-offset-0 col-sm-6 col-md-3 ',
    'col-sm-5 col-md-3'
  ];
  public headerImage: HeaderImage;
  private currentLang: string;

  constructor(
    public footerService: FooterService,
    private lajiApi: LajiApiService,
    private translate: TranslateService,
    private logger: Logger,
    private headerImageService: HeaderImageService,
    private graphQLDataService: GraphQLDataService
  ) {
  }

  ngOnInit() {
    this.headerImage = this.headerImageService.getCurrentSeason();
    this.fetchTreeData();
    this.subLangChange = this.translate.onLangChange.subscribe(() => {
      this.fetchTreeData();
    });
  }

  ngOnDestroy() {
    if (this.subLangChange) {
      this.subLangChange.unsubscribe();
    }
  }

    fetchTreeData() {
        if (this.currentLang !== this.translate.currentLang) {
          this.tree$ = this.graphQLDataService.getBaseData({
            lang: this.translate.currentLang
          }).pipe(
            map(data => data.information && data.information.children || [])
          );
        }
      return this.tree$;
    }
}
