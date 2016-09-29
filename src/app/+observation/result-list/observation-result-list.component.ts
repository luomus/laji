import {Component, OnInit, Input, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Subscription} from "rxjs";
import {Location} from "@angular/common";

import {WarehouseApi, PagedResult} from "../../shared";
import {ValueDecoratorService} from './value-decorator.sevice';
import {SearchQuery} from "../search-query.model";
import {Util} from "../../shared/service/util.service";

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: 'observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
  providers: [ValueDecoratorService]
})
export class ObservationResultListComponent implements OnInit, OnDestroy {

  @Input() columns: any = [
    {field: 'unit.taxonVerbatim,unit.linkings.taxon', translation: 'result.unit.taxonVerbatim'},
    {field: 'unit.linkings.taxon.scientificName', translation: 'result.scientificName'},
    {field: 'gathering.team'},
    {field: 'gathering.eventDate'},
    {field: 'gathering.municipality'}
  ];
  @Input() showPager: boolean = true;
  @Output() onSelect:EventEmitter<string> = new EventEmitter<string>();

  public result: PagedResult<any>;

  public loading: boolean = true;

  private subFetch: Subscription;
  private subUpdate: Subscription;
  private lastQuery:string;

  constructor(private warehouseService: WarehouseApi,
              private decorator: ValueDecoratorService,
              private searchQuery: SearchQuery,
              private location: Location) {}

  ngOnInit() {
    this.result = {
      total: this.searchQuery.page * this.searchQuery.pageSize,
      pageSize: this.searchQuery.pageSize,
      currentPage: this.searchQuery.page,
      results: []
    };
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      query => {
        this.searchQuery.page = 1;
        this.fetchRows(this.searchQuery.page);
      }
    );
    this.fetchRows(this.searchQuery.page);
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
  }

  pageChanged(event: any): void {
    if (this.searchQuery.page !== event.page) {
      this.fetchRows(event.page);
    }
  }

  fetchRows(page: number): void {
    this.searchQuery.selected = this.columns.map((column) => column.field);

    let cache = JSON.stringify(this.searchQuery.query) + page;
    let query = Util.clone(this.searchQuery.query);
    if (Object.keys(query).length === 0) {
      query.includeNonValidTaxa = false;
    }
    if (this.lastQuery == cache) {
      return;
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.lastQuery = cache;
    this.loading = true;
    this.subFetch = this.warehouseService
      .warehouseQueryListGet(
        query,
        this.searchQuery.selected,
        this.searchQuery.orderBy,
        this.searchQuery.pageSize,
        page)
      .subscribe(
        results => {
          this.searchQuery.page = results.currentPage || 1;
          if (results) {
            this.result = results;
          }
          this.searchQuery.updateUrl(this.location, undefined, [
            'selected',
            'pageSize',
            'includeNonValidTaxa'
          ]);
        },
        error => {
          console.log(error);
          this.result.results = [];
        },
        () => this.loading = false
      )
  }

  getData(row: any, propertyName: string): string {
    let val = '';
    let first = propertyName.split(',')[0];
    try {
      val = first.split('.').reduce((prev: any, curr: any) => prev[curr], row);
      val = this.decorator.decorate(first, val, row);
    } catch (e) {
    }
    return val;
  }
}
