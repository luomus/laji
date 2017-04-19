import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SearchQuery } from '../search-query.model';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { InformalTaxonGroup } from '../../shared/model/InformalTaxonGroup';
import { InformalTaxonGroupApi } from '../../shared/api/InformalTaxonGroupApi';
import { IdService } from '../../shared/service/id.service';
import { PagedResult } from '../../shared/model/PagedResult';
import { Logger } from '../../shared/logger/logger.service';
import { Util } from '../../shared/service/util.service';

@Component({
  selector: 'laji-observation-chart',
  templateUrl: './observation-char.component.html',
  styleUrls: ['./observation-char.component.css'],
  providers: [InformalTaxonGroupApi]
})
export class ObservationChartComponent implements OnInit, OnDestroy, OnChanges {

  @Input() height = 150;
  @Input() showLegend = false;
  @Input() legendPosition = 'top';
  @Input() active = true;
  @Input() public visible = true;


  public informalGroups: InformalTaxonGroup[] = [];
  public data: any;
  public loading = false;
  private group: string;

  private subDataQuery: Subscription;
  private subInformal: Subscription;
  private subCount: Subscription;
  private subTrans: Subscription;
  private subData: Subscription;

  constructor(public searchQuery: SearchQuery,
              private warehouseService: WarehouseApi,
              private informalGroupService: InformalTaxonGroupApi,
              private translate: TranslateService,
              private logger: Logger
  ) {
  }

  ngOnInit() {
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.updateInformalGroups()
    );
    this.subDataQuery = this.searchQuery.queryUpdated$.subscribe(
      (data) => {
        if (data && data['newData']) {
          this.updateData();
        }
      }
    );
    this.updateData();
  }

  ngOnChanges(changes) {
    if (!changes.visible) {
      this.updateData();
    }
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
    if (this.subDataQuery) {
      this.subDataQuery.unsubscribe();
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    if (this.subInformal) {
      this.subInformal.unsubscribe();
    }
  }

  onPieClick(group) {
    this.searchQuery.query.informalTaxonGroupId = [group.id];
    this.searchQuery.queryUpdate({'formSubmit': true});
  }

  private getInformalGroupName(id) {
    if (id === 'null') {
      return '(empty)';
    }
    return this.informalGroups
      .filter(group => group.id === id)
      .reduce((pre, cur) => cur.name, '');
  }

  private getGroupsSub(): Observable<PagedResult<InformalTaxonGroup>> {
    const lang = this.translate.currentLang;
    this.group = (
      this.searchQuery.query.informalTaxonGroupId &&
      this.searchQuery.query.informalTaxonGroupId.length === 1
    ) ?
      this.searchQuery.query.informalTaxonGroupId[0] : '';
    return this.group === '' ?
      this.informalGroupService.informalTaxonGroupFindRoots(lang) :
      this.informalGroupService.informalTaxonGroupGetChildren(this.group, lang);
  }

  private updateData() {
    if (this.subData) {
      this.subData.unsubscribe();
    }
    if (!this.active) {
      return;
    }
    const query = Util.clone(this.searchQuery.query);
    if (WarehouseApi.isEmptyQuery(query)) {
      query.cache = true;
    }
    this.loading = true;
    const sources = [];
    sources.push(this.getGroupsSub());
    sources.push(this.warehouseService
      .warehouseQueryAggregateGet(
        query,
        ['unit.linkings.taxon.informalTaxonGroup'],
        undefined,
        1000
      ));
    this.subData = Observable.forkJoin(sources).subscribe(
      (data: any) => {
        if (data[0].total === 0 && this.group !== '') {
          this.subData = this
            .informalGroupService
            .informalTaxonGroupFindById(this.group, this.translate.currentLang)
            .subscribe(
              result => {
                this.loading = false;
                this.informalGroups = [result];
                const groups = this.informalGroups.map(group => group.id);
                this.data = data[1].results
                  .map(item => {
                    return {
                      id: IdService.getId(item.aggregateBy['unit.linkings.taxon.informalTaxonGroup']),
                      value: item.count,
                      label: ''
                    };
                  })
                  .filter(item => groups.indexOf(item.id) !== -1);
                this.updateLabels();
              },
              err => this.logger.warn('Failed to fetch informal taxon group by id in chart', err)
            );
        } else {
          this.loading = false;
          this.informalGroups = data[0].results;
          if (!this.informalGroups) {
            return;
          }
          const groups = this.informalGroups.map(group => group.id);
          this.data = data[1].results
            .map(item => {
              return {
                id: IdService.getId(item.aggregateBy['unit.linkings.taxon.informalTaxonGroup']),
                value: item.count,
                label: ''
              };
            })
            .filter(item => groups.indexOf(item.id) !== -1);
          this.updateLabels();
        }
      },
      err => this.logger.warn('Failed to build informal taxon pie', err)
    );
  }

  private updateInformalGroups() {
    if (this.subInformal) {
      this.subInformal.unsubscribe();
    }
    if (!this.data) {
      this.updateData();
      return;
    }
    this.subInformal = this.getGroupsSub().subscribe(
      result => {
        this.informalGroups = result.results;
        this.updateLabels();
      }
    );
  }

  private updateLabels() {
    this.data = this.data
      .map((value) => {
        return {
          id: value.id,
          value: value.value,
          label: this.getInformalGroupName(value.id)
        };
      });
  }


}
