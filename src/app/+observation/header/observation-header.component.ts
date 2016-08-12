import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";

import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {FormattedNumber} from "../../shared/pipe/formated-number.pipe";
import {HtmlAsIs} from "../../shared/pipe/html-as-is.pipe";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-header',
  template: `<h1><span [innerHtml]="hits | formattedNumber:'&nbsp' | htmlAsIs"></span> {{'observation.results' | translate}}</h1>`,
  pipes: [FormattedNumber, HtmlAsIs]
})
export class ObservationHeaderComponent implements OnInit, OnDestroy {

  public hits:string = '';

  private subCount:Subscription;
  private subUpdate:Subscription;

  constructor(private warehouseService: WarehouseApi, private searchQuery: SearchQuery) {
  }

  ngOnInit() {
    this.updateCount();
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      query => this.updateCount()
    )
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
  }

  public updateCount() {
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    this.subCount = this.warehouseService
      .warehouseQueryCountGet(this.searchQuery.query)
      .subscribe(
        result => {
          this.hits = '' + result.total;
        },
        error => {
          console.log(error);
          this.hits = '';
        }
      )
  }


}

