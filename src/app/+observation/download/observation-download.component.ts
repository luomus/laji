import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from 'ng2-translate';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Subscription } from 'rxjs/Subscription';
import { ToastsService } from '../../shared/service/toasts.service';
import { Logger } from '../../shared/logger/logger.service';
import { AppConfig } from '../../app.config';
import { Util } from '../../shared/service/util.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import queryString from 'query-string';

@Component({
  selector: 'laji-observation-download',
  templateUrl: './observation-download.component.html'
})
export class ObservationDownloadComponent implements OnInit, OnDestroy {

  @Input() taxaLimit = 1000;
  @Input() loadLimit = 2000000;

  public requests: any = {};
  public count = {
    'count': 0,
    'private': 0
  };
  public speciesCount = 0;
  public description = '';
  public csvParams = '';
  public showRequest = true;
  public apiBase: string;
  private taxaDownloadAggregateBy = {
    'en': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameEnglish',
    'fi': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameFinnish',
    'sv': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameSwedish'
  };
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
    this.apiBase = appConfig.getApiClientBase();
  }

  ngOnInit() {
    this.translate.get([
      'observation.download.error',
      'result.load.thanksPublic',
      'result.load.thanksRequest'
    ]).subscribe((translations) => {
      this.messages = translations;
    });
    this.subLang = this.translate.onLangChange.subscribe(() => this.updateCsvLink());
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        const cacheKey = JSON.stringify(this.searchQuery.query);
        if (this.queryCache !== cacheKey) {
          this.queryCache = cacheKey;
          this.requests = {};
          this.updateCount();
          this.updateCsvLink();
        }
      }
    );
    this.updateCount();
    this.updateCsvLink();
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
    const secretQuery: WarehouseQueryInterface = Util.clone(this.searchQuery.query);
    secretQuery.secured = true;
    this.warehouseService.warehouseQueryCountGet(this.searchQuery.query)
      .combineLatest(this.warehouseService.warehouseQueryCountGet(secretQuery),
        (count, priva) => ({'count': count.total, 'private': priva.total}))
      .subscribe(res => this.count = res);

    const speciesQuery: WarehouseQueryInterface = Util.clone(this.searchQuery.query);
    speciesQuery.taxonRankId = 'MX.species';
    speciesQuery.includeNonValidTaxa = false;
    this.warehouseService.warehouseQueryAggregateGet(
      speciesQuery, ['unit.linkings.taxon.id'], undefined, 1
    ).subscribe(cnt => this.speciesCount = cnt.total);
  }

  updateCsvLink() {
    const queryParams = this.searchQuery.getQueryObject();
    queryParams['aggregateBy'] = this.taxaDownloadAggregateBy[this.translate.currentLang];
    queryParams['includeNonValidTaxa'] = 'false';
    queryParams['pageSize'] = this.taxaLimit;
    this.csvParams = queryString.stringify(queryParams);
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
      'DOCUMENT_FACTS,GATHERING_FACTS,UNIT_FACTS',
      this.searchQuery.query
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
