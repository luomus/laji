import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseQueryInterface } from '../../../../shared/model/WarehouseQueryInterface';
import { Taxonomy } from '../../../../shared/model/Taxonomy';
import { ResultService } from '../../common/service/result.service';

@Component({
  selector: 'laji-syke-insect-all-results',
  templateUrl: './syke-insect-all-results.component.html',
  styleUrls: ['./syke-insect-all-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SykeInsectAllResultsComponent implements OnInit, OnDestroy {

  @Input() collectionId: string;

  page;
  query: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  resultQuery: WarehouseQueryInterface;
  taxon$: Observable<Taxonomy>;

  year;
  currentMonth;
  currentYear;
  startMonth = 3;
  fromYear;
  fromMonth;
  allTime = '';

  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private resultService: ResultService,
    private cdr: ChangeDetectorRef
  ) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.year = now.getFullYear() - 1;
  }

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(params => {
      const time = (params['time'] && Array.isArray(params['time'])) ?
        params['time'][0] : params['time'];
      const taxonId = (params['taxonId'] && Array.isArray(params['taxonId'])) ?
        params['taxonId'][0] : params['taxonId'];
      this.emptyTime();
      this.query = {
        yearMonth: time ===  'all' ? undefined : [this.parseDateTimeRange(time || '' + this.getCurrentSeason())],
        collectionId: [this.collectionId],
        countryId: ['ML.206']
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
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.subQuery.unsubscribe();
  }

  closeList() {
    this.query.ykj10kmCenter = undefined;
    this.navigate(this.query);
  }

  showGridObservations(query: WarehouseQueryInterface) {
    this.page = 1;
    this.navigate(query);
  }

  navigate(query: WarehouseQueryInterface) {
    this.router.navigate([], {queryParams: {
        tab: 'species',
        grid: query.ykj10kmCenter,
        time: query.yearMonth || 'all',
        taxonId: query.taxonId,
        page: this.page
      }});
  }

  private getCurrentSeason() {
    if (this.currentMonth >= this.startMonth) {
      return this.currentYear;
    }
    return this.year;
  }

  private clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private parseDateTimeRange(date) {
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

  private parseDateTime(date): {year: string; month: string} {
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
