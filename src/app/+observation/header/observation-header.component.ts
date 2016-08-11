import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";

import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQueryService} from "../search-query.service";
import {FormattedNumber} from "../../shared/pipe/formated-number.pipe";
import {HtmlAsIs} from "../../shared/pipe/html-as-is.pipe";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-header',
  template: `<h1><span [innerHtml]="hits | formattedNumber:'&nbsp' | htmlAsIs"></span> {{'observation.results' | translate}}</h1>`,
  pipes: [FormattedNumber, HtmlAsIs]
})
export class ObservationHeaderComponent implements OnInit {

  public hits:string = '';

  private sub:Subscription;

  constructor(private warehouseService: WarehouseApi, private searchQuery: SearchQueryService) {
  }

  ngOnInit() {
    this.updateCount();
  }

  public updateCount() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.sub = this.warehouseService
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

