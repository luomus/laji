import { map, share } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SearchQueryService } from '../search-query.service';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { Observable, Subscription } from 'rxjs';
import { ToastsService } from '../../shared/service/toasts.service';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
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

  @Input() unitCount: number;
  @Input() speciesCount: number;
  @Input() taxaLimit = 1000;
  @Input() loadLimit = 2000000;

  privateCount$: Observable<number>;

  _query: WarehouseQueryInterface;
  hasPersonalData = false;

  public requests: {[place: string]: RequestStatus} = {};
  public requestStatus = RequestStatus;
  public count = {
    'count': 0,
    'private': 0
  };
  public description = '';
  public csvParams = '';
  private taxaDownloadAggregateBy = {
    'en': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameEnglish',
    'fi': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameFinnish',
    'sv': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameSwedish'
  };
  private subLang: Subscription;

  constructor(public searchQuery: SearchQueryService,
              public userService: UserService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private warehouseService: WarehouseApi,
              private logger: Logger,
              private cd: ChangeDetectorRef
  ) { }

  @Input() set query(query: WarehouseQueryInterface) {
    if (!query) {
      return;
    }
    let hasPersonalData = false;
    const warehouseQuery: WarehouseQueryInterface = {...query};
    ['editorPersonToken', 'observerPersonToken', 'editorOrObserverPersonToken'].forEach(key => {
      if (warehouseQuery[key]) {
        hasPersonalData = true;
        delete warehouseQuery[key];
      }
    });
    this._query = warehouseQuery;
    this.hasPersonalData = hasPersonalData;
    this.requests = {};
    this.updateCount();
    this.updateCsvLink();
  }

  ngOnInit() {
    this.updateCsvLink();
  }

  ngOnDestroy() {
    if (this.subLang) {
      this.subLang.unsubscribe();
    }
  }

  updateCount() {
    this.privateCount$ = this.warehouseService.warehouseQueryCountGet({
      ...this._query,
      secured: true
    }).pipe(
      map(result => result.total),
      share()
    );
  }

  updateCsvLink() {
    const queryParams = this.searchQuery.getQueryObject(this._query);
    queryParams['aggregateBy'] = this.taxaDownloadAggregateBy[this.translate.currentLang];
    queryParams['includeNonValidTaxa'] = 'false';
    queryParams['pageSize'] = '' + this.taxaLimit;
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
      'TSV_FLAT',
      'DOCUMENT_FACTS,GATHERING_FACTS,UNIT_FACTS',
      this._query,
      this.translate.currentLang
    ).subscribe(
      () => {
        this.toastsService.showSuccess(this.translate.instant(type === 'download' ?
          'result.load.thanksPublic' : 'result.load.thanksRequest'
        ));
        this.requests[type] = RequestStatus.done;
        this.cd.markForCheck();
      },
      err => {
        this.requests[type] = RequestStatus.error;
        this.toastsService.showError(this.translate.instant('observation.download.error'));
        this.logger.warn('Failed to make download request', err);
        this.cd.markForCheck();
      }
    );
  }
}
