import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { ResultService } from '../common/service/result.service';
import { Form } from '../../../shared/model/Form';
import { ToQNamePipe } from '../../../shared/pipe/to-qname.pipe';
import { map } from 'rxjs/operators';

enum Tabs {
  species = 'species',
  routes = 'routes'
}

@Component({
  selector: 'laji-nafi-bumblebee-result',
  templateUrl: './nafi-bumblebee-result.component.html',
  styleUrls: ['./nafi-bumblebee-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeResultComponent implements OnInit, OnDestroy {

  @Input() form: Form.SchemaForm;

  informalTaxonGroup = 'MVL.181';
  page;
  lang;
  query: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  resultQuery: WarehouseQueryInterface;
  taxon$: Observable<Taxonomy>;
  Tabs = Tabs;
  tab$: Observable<keyof typeof Tabs>;
  schemaForm: Form.SchemaForm;
  year;
  currentMonth;
  currentYear;
  startMonth = 3;
  fromYear;
  fromMonth;
  allTime = '';
  collectionId: string;

  private subTrans: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private resultService: ResultService,
    private cdr: ChangeDetectorRef,
    private qName: ToQNamePipe
  ) {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.year = now.getFullYear() - 1;
  }

  ngOnInit() {
    this.collectionId = this.qName.transform(this.form.collectionID);
    this.lang = this.translate.currentLang;
    this.tab$ = this.route.queryParams.pipe(map(paramMap => paramMap['tab']));
    this.subTrans = this.translate.onLangChange.subscribe(res => {
      this.lang = res.lang;
    });
    this.subQuery = this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (!Tabs[tab]) {
        this.router.navigate(
          [],
          {queryParams: {tab: Tabs.species}}
        );
      }
      const time = (params['time'] && Array.isArray(params['time'])) ?
        params['time'][0] : params['time'];
      const taxonId = (params['taxonId'] && Array.isArray(params['taxonId'])) ?
        params['taxonId'][0] : params['taxonId'];
      this.emptyTime();
      this.query = {
        yearMonth: time ===  'all' ? undefined : [this.parseDateTimeRange(time || '' + this.getCurrentSeason())],
        collectionId: [this.form.collectionID],
        informalTaxonGroupId: [this.informalTaxonGroup],
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
    this.subTrans.unsubscribe();
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