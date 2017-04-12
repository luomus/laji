import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { SearchQuery } from './search-query.model';

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  styles: [`
    :host {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      z-index: auto;
    }
  `],
  providers: [SearchQuery]
})
export class ObservationComponent implements OnInit, OnDestroy {
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
    this.subQuery = this.route.queryParams.subscribe(params => {
      if (params['target']) {
        this.searchQuery.query.target = [params['target']];
      }
      this.searchQuery.setQueryFromQueryObject(params);
      if (params['reset']) {
        this.searchQuery.query = {};
      }
      this.searchQuery.queryUpdate({formSubmit: !!params['reset'], newData: true});
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
