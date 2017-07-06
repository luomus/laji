import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-wbc-result',
  templateUrl: './wbc-result.component.html',
  styleUrls: ['./wbc-result.component.css']
})
export class WbcResultComponent implements OnInit, OnDestroy {

  informalTaxonGroup = 'MVL.181';
  collectionId = 'HR.175';
  page;
  type;
  lang;
  query: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  resultQuery: WarehouseQueryInterface;

  year;
  currentMonth;
  currentYear;
  startMonth = 3;
  fromYear;
  fromMonth;

  private subTrans: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService
  ) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.year = now.getFullYear() - 1;
  }

  ngOnInit() {
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
        taxonRankId: 'MX.species',
        time: [this.parseDateTimeRange(time || '' + this.getCurrentSeason())],
        collectionId: [this.collectionId],
        informalTaxonGroupId: [this.informalTaxonGroup]
      };
      this.resultQuery = this.clone(this.query);
      if (taxonId) {
        this.query.taxonId = [taxonId];
      }
      this.mapQuery = this.clone(this.query);
      if (params['grid']) {
        this.query.ykj3Center = params['grid'];
      }
      this.type = params['type'] || 'count';
      this.page = +params['page'] || 1;
    });
  }

  ngOnDestroy() {
    this.subQuery.unsubscribe();
    this.subTrans.unsubscribe();
  }

  goToPage(page) {
    this.page = page;
    this.navigate(this.query);
  }

  closeList() {
    this.query.ykj3Center = undefined;
    this.navigate(this.query);
  }

  changeLegendType(type) {
    this.type = type;
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
    return this.year;
  }

  private navigate(query: WarehouseQueryInterface) {
    this.router.navigate([], {queryParams: {
      grid: query.ykj3Center,
      time: query.time,
      taxonId: query.taxonId,
      type: this.type,
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
