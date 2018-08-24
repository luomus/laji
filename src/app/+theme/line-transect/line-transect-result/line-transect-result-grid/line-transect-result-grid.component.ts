import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { ResultService } from '../../../service/result.service';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { WarehouseApi } from '../../../../shared/api/WarehouseApi';

@Component({
  selector: 'laji-line-transect-result-grid',
  templateUrl: './line-transect-result-grid.component.html',
  styleUrls: ['./line-transect-result-grid.component.css']
})
export class LineTransectResultGridComponent implements OnInit, OnDestroy {

  @Input() informalTaxonGroup: string;
  @Input() collectionId: string;

  page;
  lang;
  query: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  resultQuery: WarehouseQueryInterface;
  taxon$: Observable<Taxonomy>;

  lastYear;
  currentMonth;
  currentYear;
  startMonth = 4;
  fromYear;
  fromMonth;
  startYear;
  endYear;
  years: string[] = [];

  private subTrans: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private resultService: ResultService,
    private warehouseApi: WarehouseApi
  ) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.lastYear = now.getFullYear() - 1;
  }

  ngOnInit() {
    this.warehouseApi.warehouseQueryAggregateGet(
      {collectionId: [this.collectionId], includeSubCollections: false},
      ['gathering.conversions.year'],
      ['gathering.conversions.year DESC'],
      200
    )
      .subscribe(result => {
        if (result && result.results) {
          this.years = result.results.map(item => +item.aggregateBy['gathering.conversions.year']);
          if (this.years.length > 0) {
            this.startYear = this.years[this.years.length - 1];
            this.endYear = this.years[0];
          }
        }
      });
    this.lang = this.translate.currentLang;
    this.subTrans = this.translate.onLangChange.subscribe(res => {
      this.lang = res.lang;
    });
    this.subQuery = this.route.queryParams.subscribe(params => {
      const time = (params['time'] && Array.isArray(params['time'])) ?
        params['time'][0] : params['time'];
      const taxonId = (params['taxonId'] && Array.isArray(params['taxonId'])) ?
        params['taxonId'][0] : params['taxonId'];
      this.query = {
        yearMonth: [this.parseDateTimeRange(time || '' + this.getCurrentSeason())],
        collectionId: [this.collectionId],
        informalTaxonGroupId: [this.informalTaxonGroup],
        pairCounts: true,
        includeSubCollections: false
      };
      this.resultQuery = this.clone(this.query);
      if (taxonId) {
        this.query.taxonId = [taxonId];
        this.taxon$ = this.resultService.getTaxon(taxonId);
      } else {
        this.taxon$ = ObservableOf(null);
      }
      this.mapQuery = this.clone(this.query);
      if (params['grid']) {
        this.query.ykj10kmCenter = params['grid'];
      }
      this.page = +params['page'] || 1;
    });
  }

  ngOnDestroy() {
    this.subQuery.unsubscribe();
    this.subTrans.unsubscribe();
  }

  closeList() {
    this.query.ykj10kmCenter = undefined;
    this.navigate(this.query);
  }

  showGridObservations(query: WarehouseQueryInterface) {
    this.page = 1;
    this.navigate(query);
  }

  private getCurrentSeason() {
    if (this.currentMonth >= this.startMonth) {
      return this.currentYear;
    }
    return this.lastYear;
  }

  private navigate(query: WarehouseQueryInterface) {
    this.router.navigate([], {queryParams: {
      grid: query.ykj10kmCenter,
      time: query.time,
      taxonId: query.taxonId,
      page: this.page
    }});
  }

  private clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private parseDateTimeRange(date) {
    this.emptyTime();
    if (!date || typeof date !== 'string') {
      return date;
    }
    if (date.indexOf('/') > -1) {
      return date;
    }
    const time = this.parseDateTime(date);
    this.fromYear = time.year;
    this.fromMonth = time.month;

    return date;
  }

  private parseDateTime(date): {year: string, month: string} {
    if (date.length === '4') {
      return {year: date, month: ''};
    }
    const month = date.substr(5, 2);
    return {
      year: date.substr(0, 4),
      month: month ? 'm-' + month : '',
    };
  }

  private emptyTime() {
    this.fromYear = '';
    this.fromMonth = '';
  }

}
