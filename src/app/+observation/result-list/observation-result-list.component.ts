import {Component, OnInit, Input, OnDestroy, Output, EventEmitter} from '@angular/core';
import {PAGINATION_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {FORM_DIRECTIVES} from '@angular/forms';
import {Subscription} from "rxjs";
import {Location} from "@angular/common";

import {WarehouseApi, PagedResult} from "../../shared";
import {ValueDecoratorService} from './value-decorator.sevice';
import {SearchQuery} from "../search-query.model";

@Component({
  selector: 'laji-observation-result-list',
  templateUrl: 'observation-result-list.component.html',
  styleUrls: ['./observation-result-list.component.css'],
  directives: [PAGINATION_DIRECTIVES, FORM_DIRECTIVES],
  providers: [ValueDecoratorService]
})
export class ObservationResultListComponent implements OnInit, OnDestroy {

  @Input() columns: any = [
    {field: 'unit.taxonVerbatim,unit.linkings', translation: 'result.unit.taxonVerbatim'},
    {field: 'gathering.team'},
    {field: 'gathering.eventDate'},
    {field: 'gathering.municipality'},
    {field: 'document.documentId'}
  ];
  @Input() showPager: boolean = true;
  @Output() onSelect:EventEmitter<string> = new EventEmitter<string>();

  public result: PagedResult<any>;

  public loading: boolean = true;

  private subFetch: Subscription;
  private subUpdate: Subscription;

  constructor(private warehouseService: WarehouseApi,
              private decorator: ValueDecoratorService,
              private searchQuery: SearchQuery,
              private location: Location) {

  }

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
    this.loading = true;
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.warehouseService
      .warehouseQueryListGet(
        this.searchQuery.query,
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
            'includeNonValidTaxons'
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
      val = this.decorator.decorate(first, val, row)
    } catch (e) {
    }
    return val;
  }
}
