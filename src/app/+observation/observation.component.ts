import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SearchQuery } from './search-query.model';
declare let d3: any;

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  providers: [SearchQuery]
})
export class ObservationComponent implements OnInit, OnDestroy, AfterViewInit {
  public tab: string;
  public page: number;
  public options: any;
  public data: any;

  private subParam: Subscription;
  private subQuery: Subscription;

  constructor(private route: ActivatedRoute,
              public searchQuery: SearchQuery) {
  }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.tab = params['tab'] || 'map';
    });
  }

  ngAfterViewInit() {
    this.subQuery = this.route.queryParams.subscribe(params => {
      this.searchQuery.page = +params['page'] || 1;
      if (params['target']) {
        this.searchQuery.query.target = [params['target']];
      }
      this.searchQuery.setQueryFromQueryObject(params);
      this.searchQuery.queryUpdate({formSubmit: true, newData: true});
    });
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }
}
