import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, ROUTER_DIRECTIVES} from "@angular/router";
import {Location} from "@angular/common";
import {URLSearchParams} from "@angular/http";

import { ObservationHeaderComponent } from "./header/observation-header.component";
import { WarehouseApi } from "../shared/api/WarehouseApi";
import {ObservationResultComponent} from "./result/observation-result.component";
import {SearchQuery} from "./search-query.model";
import {ObservationFormComponent} from "./form/observation-form.component";
import {PieChartComponent} from "../shared/chart/pie/pie-chart.component";
declare let d3:any;

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  directives: [
    ObservationResultComponent,
    ObservationHeaderComponent,
    ROUTER_DIRECTIVES,
    ObservationFormComponent,
    PieChartComponent
  ],
  providers: [ SearchQuery ]
})
export class ObservationComponent implements OnInit, OnDestroy {
  public tab:string;
  public page:number;

  private subParam:Subscription;

  public options:any;
  public data:any;

  constructor(private route: ActivatedRoute, public searchQuery: SearchQuery, private location: Location) {
  }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.tab = params['tab'] || 'list';
      this.searchQuery.page = +params['page'] || 1;
    });
    this.searchQuery.setQueryFromURLSearchParams(new URLSearchParams(this.location.path(true).replace('?','?skip=true&')));
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }
}
