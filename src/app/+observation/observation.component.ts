import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, ROUTER_DIRECTIVES} from "@angular/router";

import { ObservationHeaderComponent } from "./header/observation-header.component";
import { WarehouseApi } from "../shared/api/WarehouseApi";
import {ObservationResultComponent} from "./result/observation-result.component";
import {SearchQuery} from "./search-query.model";
import {ObservationFormComponent} from "./form/observation-form.component";

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  directives: [
    ObservationResultComponent,
    ObservationHeaderComponent,
    ROUTER_DIRECTIVES,
    ObservationFormComponent
  ],
  providers: [ SearchQuery, WarehouseApi ]
})
export class ObservationComponent implements OnInit, OnDestroy {
  public tab:string;
  public page:number;

  private subParam:Subscription;

  constructor(private route: ActivatedRoute, public searchQuery: SearchQuery) {
  }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.tab = params['tab'] || 'list';
      this.searchQuery.page = +params['page'] || 1;
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }
}
