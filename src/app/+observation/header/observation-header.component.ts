import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";

import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {FormattedNumber} from "../../shared/pipe/formated-number.pipe";
import {HtmlAsIs} from "../../shared/pipe/html-as-is.pipe";
import {SpinnerComponent} from "../../shared/spinner/spinner.component";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-header',
  templateUrl: 'observation-header.component.html',
  directives: [ SpinnerComponent ],
  pipes: [FormattedNumber, HtmlAsIs]
})
export class ObservationHeaderComponent implements OnInit, OnDestroy {

  public hits:string = '';
  public loading:boolean = true;

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
    this.loading = true;
    this.subCount = this.warehouseService
      .warehouseQueryCountGet(this.searchQuery.query)
      .subscribe(
        result => {
          this.hits = '' + result.total;
          this.loading = false;
        },
        error => {
          console.log(error);
          this.hits = '';
        }
      )
  }


}

