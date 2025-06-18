import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { ResultService } from '../common/service/result.service';
import { Form } from '../../../shared/model/Form';
import { ToQNamePipe } from '../../../shared/pipe/to-qname.pipe';
import { map } from 'rxjs/operators';
import type { components } from 'projects/laji-api-client-b/generated/api';

type Taxon = components['schemas']['Taxon'];

enum Tabs {
  species = 'species',
  routes = 'routes'
}

@Component({
  selector: 'laji-syke-insect-result',
  templateUrl: './syke-insect-result.component.html',
  styleUrls: ['./syke-insect-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SykeInsectResultComponent implements OnInit, OnDestroy {

  @Input() form!: Form.SchemaForm;

  informalTaxonGroup = 'MVL.181';
  page!: number;
  query!: WarehouseQueryInterface;
  mapQuery!: WarehouseQueryInterface;
  resultQuery!: WarehouseQueryInterface;
  taxon$!: Observable<Taxon> | Observable<null>;
  Tabs = Tabs; // eslint-disable-line @typescript-eslint/naming-convention
  tab$!: Observable<keyof typeof Tabs>;
  year;
  currentMonth;
  currentYear;
  startMonth = 3;
  fromYear?: string;
  fromMonth?: string;
  allTime = '';
  collectionId?: string;
  bumblebeeCollectionId = 'HR.3911';

  private subQuery!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
    this.tab$ = this.route.queryParams.pipe(map(paramMap => paramMap['tab']));
    this.subQuery = this.route.queryParams.subscribe(params => {
      const tab: Tabs.species | Tabs.routes = params['tab'];
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        collectionId: [this.form.collectionID!],
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
  }

  private getCurrentSeason() {
    if (this.currentMonth >= this.startMonth) {
      return this.currentYear;
    }
    return this.year;
  }

  private clone(obj: WarehouseQueryInterface) {
    return JSON.parse(JSON.stringify(obj));
  }

  private parseDateTimeRange(date: any) {
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

  private parseDateTime(date: any): {year: string; month: string} {
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
