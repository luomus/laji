import {Component, OnInit, OnDestroy, Input, OnChanges} from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

import {PieChartComponent} from "../../shared/chart/pie/pie-chart.component";
import {SearchQuery} from "../search-query.model";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {Subscription, Observable} from "rxjs";
import {InformalTaxonGroup} from "../../shared/model/InformalTaxonGroup";
import {InformalTaxonGroupApi} from "../../shared/api/InformalTaxonGroupApi";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-chart',
  templateUrl: 'observation-char.component.html',
  styleUrls: ['./observation-char.component.css'],
  directives: [ PieChartComponent ],
  providers: [ InformalTaxonGroupApi ]
})
export class ObservationChartComponent implements OnInit, OnDestroy, OnChanges {

  @Input() height: number = 150;
  @Input() showLegend:boolean = false;
  @Input() legendPosition:string = 'top';
  @Input() active:boolean = true;


  public informalGroups:InformalTaxonGroup[] = [];
  public data:any;
  private group:string;
  private lastQuery:string;
  private loading:boolean = false;

  private subDataQuery: Subscription;
  private subInformal: Subscription;
  private subCount: Subscription;
  private subTrans: Subscription;
  private subData: Subscription;

  constructor(
    public searchQuery: SearchQuery,
    private warehouseService: WarehouseApi,
    private informalGroupService: InformalTaxonGroupApi,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.updateInformalGroups()
    );
    this.subDataQuery = this.searchQuery.queryUpdated$.subscribe(
      () => this.updateData()
    );
    this.updateData();
  }

  ngOnChanges() {
    this.updateData();
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

  private getInformalGroupName(id) {
    if (id === 'null') {
      return '(empty)'
    }
    return this.informalGroups
      .filter(group => group.id === id)
      .reduce((pre, cur) => cur.name, '');
  }

  private getGroupsSub() {
    let lang = this.translate.currentLang;
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
    let query = this.searchQuery.query;
    let cacheKey = JSON.stringify(query) + this.translate.currentLang;
    if (this.lastQuery == cacheKey) {
      return;
    }
    if (this.subData) {
      this.subData.unsubscribe();
    }
    if (!this.active) {
      return;
    }
    this.lastQuery = cacheKey;
    this.loading = true;
    let sources = [];
    sources.push(this.getGroupsSub());
    sources.push(this.warehouseService
      .warehouseQueryAggregateGet(
        this.searchQuery.query,
        ['unit.linkings.taxon.informalTaxonGroup'],
        undefined,
        1000
      ));
    this.subData = Observable.forkJoin(sources).subscribe(
      data => {
        if (data[0].total === 0 && this.group !== '') {
          this.subData = this
            .informalGroupService
            .informalTaxonGroupFindById(this.group, this.translate.currentLang)
            .subscribe(
              result => {
                this.loading = false;
                this.informalGroups = [result];
                let groups = this.informalGroups.map(group => group.id);
                this.data = data[1].results
                  .map(item => {
                    return {
                      id: item.aggregateBy['unit.linkings.taxon.informalTaxonGroup'].replace('http://tun.fi/',''),
                      value: item.count,
                      label: ''
                    }
                  })
                  .filter(item => groups.indexOf(item.id) !== -1);
                this.updateLabels();
              },
              err => console.log(err)
            )
        } else {
          this.loading = false;
          this.informalGroups = data[0].results;
          if (!this.informalGroups) {
            return;
          }
          let groups = this.informalGroups.map(group => group.id);
          this.data = data[1].results
            .map(item => {
              return {
                id: item.aggregateBy['unit.linkings.taxon.informalTaxonGroup'].replace('http://tun.fi/',''),
                value: item.count,
                label: ''
              }
            })
            .filter(item => groups.indexOf(item.id) !== -1);
          this.updateLabels();
        }
      },
      err => console.log(err)
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
        }
      })
      .sort((a,b) => {
        if (a.label < b.label)
          return -1;
        return (a.label > b.label) ? 1 : 0;
      });
  }

  onPieClick(group) {
    this.searchQuery.query.informalTaxonGroupId = [group.id];
    this.searchQuery.queryUpdate();
  }

}
