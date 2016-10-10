import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from 'ng2-translate';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Subscription } from 'rxjs';

@Component({
  selector: 'observation-download',
  templateUrl: 'observation-download.component.html'
})
export class ObservationDownloadComponent implements OnInit, OnDestroy {

  @Input() loadLimit = 200000;

  public requests: any = {};
  public count = {
    'count': 0,
    'private': 0
  };
  private queryCache: string;
  private subQueryUpdate: Subscription;

  constructor(public searchQuery: SearchQuery,
              public userService: UserService,
              public translate: TranslateService,
              private warehouseService: WarehouseApi) {
  }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        if (this.queryCache !== JSON.stringify(this.searchQuery.query)) {
          this.requests = {};
          this.updateCount();
        }
      }
    );
    this.updateCount();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
  }

  updateCount() {
    this.warehouseService.warehouseQueryCountGet(this.searchQuery.query)
      .combineLatest(
        this.warehouseService.warehouseQueryAggregateGet(this.searchQuery.query, ['document.secureLevel'])
          .do(aggr => console.log(aggr))
          .map(aggrs => {
            const pick = ['HIGHEST', 'KM100', 'KM50', 'KM25', 'KM10'];
            let cnt = 0;
            if (aggrs.results) {
              aggrs.results.map(aggr => {
                if (aggr['aggregateBy'] && aggr['aggregateBy']['document.secureLevel']
                  && pick.indexOf(aggr['aggregateBy']['document.secureLevel']) > -1) {
                  cnt += aggr['count'];
                }
              });
            }
            return cnt;
          }),
        (count, priva) => ({'count': count.total, 'private': priva}))
      .subscribe(res => this.count = res);
  }

  makePrivateRequest() {
    this.makeRequest('downloadApprovalRequest');
  }

  makePublicRequest() {
    this.makeRequest('download');
  }

  makeRequest(type: string) {
    this.queryCache = JSON.stringify(this.searchQuery.query);
    if (this.requests[type] === this.queryCache) {
      return;
    }
    this.requests[type] = this.queryCache;
    this.userService.getToken();
    this.warehouseService[type](
      this.userService.getToken(),
      'CSV_FLAT',
      'UNIT_FACTS',
      this.searchQuery.query
    ).subscribe(
      _ => {
        this.requests[type] = 'sent';
      },
      err => {
        this.requests[type] = 'error';
        console.log(err);
      }
    );
  }
}
