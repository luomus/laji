import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from 'ng2-translate';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Subscription, Observable } from 'rxjs';
import { ToastsService } from '../../shared/service/toasts.service';
import { Logger } from '../../shared/logger/logger.service';
import { AppConfig } from '../../app.config';

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
  private subLang: Subscription;
  private messages = {};

  constructor(public searchQuery: SearchQuery,
              public userService: UserService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private warehouseService: WarehouseApi,
              private logger: Logger,
              private appConfig: AppConfig
  ) {
    if (appConfig.getEnv() === 'prod') {
      this.showRequest = false;
    }
  }

  ngOnInit() {
    this.subLang = this.translate.get([
      'observation.download.error',
      'result.load.thanksPublic',
      'result.load.thanksRequest'
    ]).subscribe((translations) => {
      this.messages = translations;
    });
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
    if (this.subLang) {
      this.subLang.unsubscribe();
    }
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
      'DOCUMENT_FACTS,GATHERING_FACTS,UNIT_FACTS',
      this.searchQuery.query,
      this.translate.currentLang,
      description
    ).subscribe(
      () => {
        this.toastsService.showSuccess(this.messages[type === 'download' ?
          'result.load.thanksPublic' : 'result.load.thanksRequest'
        ]);
        this.requests[type] = 'sent';
      },
      err => {
        this.requests[type] = 'error';
        this.toastsService.showError(this.messages['observation.download.error']);
        this.logger.warn('Failed to make download request', err);
      }
    );
  }
}
