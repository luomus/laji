import { map, switchMap } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { SearchQueryService } from '../search-query.service';
import { ISettingResultList, UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { ToastsService } from '../../shared/service/toasts.service';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { BsModalService, ModalDirective } from 'ngx-bootstrap';
import { BookType } from 'xlsx';
import { ObservationResultService } from '../../shared-modules/observation-result/service/observation-result.service';
import { TableColumnService } from '../../shared-modules/datatable/service/table-column.service';
import { ExportService } from '../../shared/service/export.service';


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
export class ObservationDownloadComponent implements OnDestroy {

  @ViewChild('downloadModal', { static: true }) modal: ModalDirective;

  @Input() unitCount: number;
  @Input() speciesCount: number;
  @Input() taxaLimit = 1000;
  @Input() loadLimit = 2000000;
  @Input() maxSimpleDownload = 10000;
  @Input() settings: ISettingResultList;

  privateCount: number;
  hasPersonalData = false;
  requests: {[place: string]: RequestStatus} = {};
  requestStatus = RequestStatus;
  downloadLoading = false;
  description = '';
  csvParams = '';

  private cntSub: Subscription;
  private _query: WarehouseQueryInterface;
  private taxaDownloadAggregateBy = {
    'en': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameEnglish',
    'fi': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameFinnish',
    'sv': 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameSwedish'
  };

  constructor(public searchQuery: SearchQueryService,
              public userService: UserService,
              public translate: TranslateService,
              private observationResultService: ObservationResultService,
              private toastsService: ToastsService,
              private warehouseService: WarehouseApi,
              private logger: Logger,
              private cd: ChangeDetectorRef,
              private tableColumnService: TableColumnService,
              private exportService: ExportService,
              private modalService: BsModalService
  ) { }

  ngOnDestroy(): void {
    if (this.cntSub) {
      this.cntSub.unsubscribe();
    }
  }

  openModal() {
    this.modal.show();
  }

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

  get query(): WarehouseQueryInterface {
    return this._query;
  }

  updateCount() {
    this.cntSub = this.warehouseService.warehouseQueryCountGet({
      ...this.query,
      secured: true
    }).pipe(
      map(result => result.total)
    ).subscribe(cnt => {
      this.privateCount = cnt;
      this.cd.markForCheck();
    });
  }

  updateCsvLink() {
    const queryParams = this.searchQuery.getQueryObject(this.query);
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
      this.query,
      this.translate.currentLang
    ).subscribe(
      () => {
        this.toastsService.showSuccess(this.translate.instant(type === 'download' ?
          'result.load.thanksPublic' : 'result.load.thanksRequest'
        ));
        this.requests[type] = RequestStatus.done;
        this.modal.hide();
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

  close() {
    this.modal.hide();
  }

  download(type: any) {
    this.downloadLoading = true;
    const selected = this.settings ? this.settings.selected : this.tableColumnService.defaultFields;
    const columns = this.tableColumnService.getColumns(selected);
    this.observationResultService.getAll(
      this.query,
      this.tableColumnService.getSelectFields(selected, this.query),
      [],
      this.translate.currentLang
    ).pipe(
      switchMap(data => this.exportService.export(data, columns, type as BookType, 'laji-data'))
    ).subscribe(
      () => {
        this.downloadLoading = false;
        this.modalService.hide(this.modalService.getModalsCount());
        this.modal.hide();
        this.cd.markForCheck();
      },
      (err) => this.logger.error('Simple download failed', err)
    );
  }
}
