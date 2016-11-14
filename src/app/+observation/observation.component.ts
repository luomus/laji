import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { URLSearchParams } from '@angular/http';
import { SearchQuery } from './search-query.model';
import { FooterService } from '../shared/service/footer.service';
declare let d3: any;

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  providers: [SearchQuery]
})
export class ObservationComponent implements OnInit, OnDestroy {
  public tab: string;
  public page: number;
  public options: any;
  public data: any;

  private subParam: Subscription;

  constructor(private route: ActivatedRoute,
              public searchQuery: SearchQuery,
              private location: Location) {
  }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.tab = params['tab'] || 'map';
      this.searchQuery.page = +params['page'] || 1;
      if (params['target']) {
        this.searchQuery.query.target = [params['target']];
      }
    });
    let location = this.location.path(true);
    if (location.indexOf('?') > -1) {
      this.searchQuery.setQueryFromURLSearchParams(new URLSearchParams(this.location.path(true).replace('?', '?skip=true&')));
    }
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }
}
