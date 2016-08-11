import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, ROUTER_DIRECTIVES} from "@angular/router";

import { SearchQueryService, WarehouseQueryInterface, SearchResultComponent } from '../shared';

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  directives: [ SearchResultComponent, ROUTER_DIRECTIVES ],
  providers: [ SearchQueryService ]
})
export class ObservationComponent implements OnInit, OnDestroy {
  public tab:string;
  public page:number;

  private subParam:Subscription;

  constructor(private route: ActivatedRoute, public searchQuery: SearchQueryService) {
    this.searchQuery.query = {
      finnish: true,
      invasive: true,
      lifeStage: ['ADULT']
    };
    this.searchQuery.pageSize = 20;
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
