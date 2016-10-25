import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from 'ng2-translate';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Subscription } from 'rxjs';
const config = require('../../../../config.json');

@Component({
  selector: 'observation-download',
  templateUrl: 'observation-download.component.html'
})
export class ObservationDownloadComponent implements OnInit, OnDestroy {

  @Input() loadLimit = 200000;
  @Input() descriptionLimit = 200;

  public charactersLeft;
  public requests: any = {};
  public count = {
    'count': 0,
    'private': 0
  };
  public description: string = '';
  public showRequest = true;
  private queryCache: string;
  private subQueryUpdate: Subscription;

  constructor(public searchQuery: SearchQuery,
              public userService: UserService,
              public translate: TranslateService,
              private warehouseService: WarehouseApi) {
    if (config.env && config.env === 'prod') {
      this.showRequest = false;
    }
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
    this.cntCharactersLeft();
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
    this.makeRequest('downloadApprovalRequest', this.description);
  }

  makePublicRequest() {
    this.makeRequest('download', '');
  }

  cntCharactersLeft() {
    this.charactersLeft = this.descriptionLimit - (this.description.length);
  }

  makeRequest(type: string, description) {
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
      this.searchQuery.query,
      this.translate.currentLang,
      description
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
