import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, ROUTER_DIRECTIVES} from "@angular/router";

import { ObservationHeaderComponent } from "./header/observation-header.component";
import { WarehouseApi } from "../shared/api/WarehouseApi";
import {ObservationResultComponent} from "./result/observation-result.component";
import {SearchQueryService} from "./search-query.service";

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  directives: [ ObservationResultComponent, ObservationHeaderComponent, ROUTER_DIRECTIVES ],
  providers: [ SearchQueryService, WarehouseApi ]
})
export class ObservationComponent implements OnInit, OnDestroy {
  public tab:string;
  public page:number;

  private subParam:Subscription;

  constructor(private route: ActivatedRoute, public searchQuery: SearchQueryService) {
    this.searchQuery.query = {
    };
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
