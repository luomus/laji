import {Component, OnInit, Input} from '@angular/core';
import { PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import {FORM_DIRECTIVES} from '@angular/forms';

import {WarehouseQueryInterface, PagedResult} from "../../model";
import {WarehouseApi} from "../../api";
import { ValueDecoratorService } from './value-decorator.sevice';
import {Subscription} from "rxjs";

@Component({
  selector: 'laji-search-result-list',
  templateUrl: 'search-result-list.component.html',
  directives: [ PAGINATION_DIRECTIVES, FORM_DIRECTIVES ],
  providers: [WarehouseApi]
})
export class SearchResultListComponent implements OnInit {

  @Input() query: WarehouseQueryInterface;
  @Input() columns: any = [
    {field: 'unit.linkings.taxon'},
    {field: 'gathering.team'},
    {field: 'gathering.eventDate'},
    {field: 'document.documentId'}
  ];
  @Input() pageSize:number;
  @Input() showPager:boolean = true;

  public page:number = 1;

  public result: PagedResult<any>;

  public loading:boolean = true;

  private decorator:ValueDecoratorService;

  private sub:Subscription;

  constructor(private warehouseService:WarehouseApi) {
    this.decorator = new ValueDecoratorService();
  }

  ngOnInit() {
    this.fetchRows(this.page, this.pageSize);
  }

  pageChanged(event:any):void {
    this.fetchRows(event.page, this.pageSize);
  }

  fetchRows(page:number, pageSize:number):void {
    let fields = this.columns.map((column) => column.field);
    this.loading = true;
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.sub = this.warehouseService
      .warehouseQueryListGet(this.query, false, fields, ['gathering.eventDate.begin desc'], pageSize, page)
      .debounceTime(400)
      .subscribe(
      results => {
        this.result = results;
        this.loading = false;
      },
      error => {
        console.log(error);
        this.result.results = [];
        this.loading = false;
      }
    )
  }

  getData(row:any, propertyName:string):string {
    let val = '';
    try {
      val = propertyName.split('.').reduce((prev:any, curr:string) => prev[curr], row)
      val = this.decorator.decorate(propertyName, val, row)
    } catch(e) {}
    return val;
  }
}
