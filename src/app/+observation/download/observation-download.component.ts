import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Subscription } from 'rxjs/Subscription';
import { ToastsService } from '../../shared/service/toasts.service';
import { Logger } from '../../shared/logger/logger.service';
import { Util } from '../../shared/service/util.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { HttpParams } from '@angular/common/http';

enum RequestStatus {
  error = <any> 'error',
  loading = <any> 'loading',
  done = <any> 'done',
}

@Component({
  selector: 'laji-observation-download',
  templateUrl: './observation-download.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationDownloadComponent implements OnInit, OnDestroy {

  @Input() taxaLimit = 1000;
  @Input() loadLimit = 2000000;

  _query: WarehouseQueryInterface;
  hasPersonalData = false;

  public requests: {[place: string]: RequestStatus} = {};
  public requestStatus = RequestStatus;
  public count = {
    'count': 0,
    'private': 0
  };
  public speciesCount = 0;
  public description = '';
  public csvParams = '';
  public showRequest = true;
  private taxaDownloadAggregateBy = {
    'en': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameEnglish',
    'fi': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameFinnish',
    'sv': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameSwedish'
  };
  private queryCache: string;
  private subLang: Subscription;
  private messages = {};

  constructor(public searchQuery: SearchQuery,
              public userService: UserService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private warehouseService: WarehouseApi,
              private logger: Logger,
              private cd: ChangeDetectorRef
  ) {
    if (environment.production) {
      this.showRequest = false;
    }
  }

  @Input() set query(query: WarehouseQueryInterface) {
    if (!query) {
      return;
    }
    this.hasPersonalData = !!query.editorPersonToken || !!query.observerPersonToken || !!query.editorOrObserverPersonToken;
    const warehouseQuery: WarehouseQueryInterface = Util.clone(query);
    if (warehouseQuery.editorPersonToken) {
      delete warehouseQuery.editorPersonToken;
    }
    if (warehouseQuery.observerPersonToken) {
      delete warehouseQuery.observerPersonToken;
    }
    if (warehouseQuery.editorOrObserverPersonToken) {
      delete warehouseQuery.editorOrObserverPersonToken;
    }
    this._query = warehouseQuery;
    const cacheKey = JSON.stringify(this._query);
    if (this.queryCache !== cacheKey) {
      this.queryCache = cacheKey;
      this.requests = {};
      this.updateCount();
      this.updateCsvLink();
    }
  }

  ngOnInit() {
    this.subLang = this.translate.onLangChange
      .startWith({})
      .switchMap(() => this.translate.get([
          'observation.download.error',
          'result.load.thanksPublic',
          'result.load.thanksRequest'
        ]))
      .subscribe((translations) => {
        this.messages = translations;
        this.updateCsvLink();
        this.cd.markForCheck();
      });
  }

  ngOnDestroy() {
    if (this.subLang) {
      this.subLang.unsubscribe();
    }
  }

  updateCount() {
    const secretQuery: WarehouseQueryInterface = Util.clone(this._query);
    const speciesQuery: WarehouseQueryInterface = Util.clone(this._query);

    if (WarehouseApi.isEmptyQuery(secretQuery)) {
      secretQuery.cache = true;
    }
    if (WarehouseApi.isEmptyQuery(speciesQuery)) {
      speciesQuery.cache = true;
    }

    secretQuery.secured = true;
    speciesQuery.taxonRankId = 'MX.species';
    speciesQuery.includeNonValidTaxa = false;

    Observable.forkJoin(
      this.warehouseService.warehouseQueryCountGet(this._query)
        .combineLatest(this.warehouseService.warehouseQueryCountGet(secretQuery),
          (count, priva) => ({'count': count.total, 'private': priva.total})),
      this.warehouseService.warehouseQueryAggregateGet(
        speciesQuery, ['unit.linkings.taxon.id'], undefined, 1
      )
    ).subscribe((data) => {
        this.count = data[0];
        this.speciesCount = data[1] && data[1].total;
        this.cd.markForCheck();
    });
  }

  updateCsvLink() {
    const queryParams = this.searchQuery.getQueryObject();
    queryParams['aggregateBy'] = this.taxaDownloadAggregateBy[this.translate.currentLang];
    queryParams['includeNonValidTaxa'] = false;
    queryParams['pageSize'] = this.taxaLimit;
    if (queryParams['editorPersonToken']) {
      delete queryParams['editorPersonToken'];
    }
    if (queryParams['observerPersonToken']) {
      delete queryParams['observerPersonToken'];
    }
    if (queryParams['editorOrObserverPersonToken']) {
      delete queryParams['editorOrObserverPersonToken'];
    }
    const params = new HttpParams({fromObject: <any>queryParams});
    this.csvParams = params.toString();
  }

  makePrivateRequest() {
    this.makeRequest('downloadApprovalRequest');
  }

  makePublicRequest() {
    this.makeRequest('download');
  }

  makeRequest(type: string) {
    if (this.requests[type] === RequestStatus.loading || this.requests[type] === RequestStatus.done) {
      return;
    }
    this.requests[type] = RequestStatus.loading;
    this.userService.getToken();
    this.warehouseService[type](
      this.userService.getToken(),
      'CSV_FLAT',
      'DOCUMENT_FACTS,GATHERING_FACTS,UNIT_FACTS',
      this._query,
      this.translate.currentLang
    ).subscribe(
      () => {
        this.toastsService.showSuccess(this.messages[type === 'download' ?
          'result.load.thanksPublic' : 'result.load.thanksRequest'
        ]);
        this.requests[type] = RequestStatus.done;
        this.cd.markForCheck();
      },
      err => {
        this.requests[type] = RequestStatus.error;
        this.toastsService.showError(this.messages['observation.download.error']);
        this.logger.warn('Failed to make download request', err);
        this.cd.markForCheck();
      }
    );
  }
}
