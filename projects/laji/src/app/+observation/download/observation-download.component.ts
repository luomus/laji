import { catchError, map, switchMap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  Input,
  OnDestroy, Output,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { SearchQueryService } from '../search-query.service';
import { ISettingResultList, UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { ToastsService } from '../../shared/service/toasts.service';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BookType } from 'xlsx';
import { ObservationResultService } from '../../shared-modules/observation-result/service/observation-result.service';
import { IColumnGroup, TableColumnService } from '../../shared-modules/datatable/service/table-column.service';
import { ExportService } from '../../shared/service/export.service';
import { Global } from '../../../environments/global';
import { DownloadComponent } from '../../shared-modules/download/download.component';
import {
  ObservationTableSettingsComponent
} from '../../shared-modules/observation-result/observation-table/observation-table-settings.component';
import { ColumnSelector } from '../../shared/columnselector/ColumnSelector';
import { ObservationTableColumn } from '../../shared-modules/observation-result/model/observation-table-column';
import { IColumns } from '../../shared-modules/datatable/service/observation-table-column.service';
import { ObservationDataService } from '../observation-data.service';
import { environment } from '../../../environments/environment';
import { DownloadService } from '../../shared/service/download.service';


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

  @ViewChild(ObservationTableSettingsComponent, { static: true }) public settingsModal: ObservationTableSettingsComponent;
  @ViewChild(DownloadComponent) downloadTypeSelectModal: DownloadComponent;
  @ViewChild('downloadModal', { static: true }) downloadModal: TemplateRef<any>;

  @Input() unitCount: number;
  @Input() speciesCount: number;
  @Input() taxaLimit = 3000;
  @Input() loadLimit = 2000000;
  @Input() maxSimpleDownload = Global.limit.simpleDownload;

  @Output() settingsChange = new EventEmitter<ISettingResultList>();

  privateCount: number;
  hasPersonalData = false;
  requests: {[place: string]: RequestStatus} = {};
  requestStatus = RequestStatus;
  downloadLoading = false;
  description = '';
  csvParams = '';
  reason = '';
  reasonEnum = '';
  columnSelector = new ColumnSelector;
  columnGroups: IColumnGroup<IColumns>[][];
  columnLookup = {};

  speciesCsvLoading = false;

  linkTimeout: any;

  private _originalSelected: string[];
  private _settings: ISettingResultList;
  private modalRef: BsModalRef;
  private cntSub: Subscription;
  private _query: WarehouseQueryInterface;
  private _originalQuery: WarehouseQueryInterface;
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
              private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>,
              private exportService: ExportService,
              private modalService: BsModalService,
              private observationDataService: ObservationDataService,
              private downloadService: DownloadService
  ) {
    this.columnGroups = tableColumnService.getColumnGroups();
    this.columnLookup = tableColumnService.getAllColumnLookup();
    this.columnSelector.columns = this.tableColumnService.getDefaultFields();
    this.columnSelector.required = this.tableColumnService.getRequiredFields();
    this._originalSelected = this.tableColumnService.getDefaultFields();
  }

  ngOnDestroy(): void {
    if (this.cntSub) {
      this.cntSub.unsubscribe();
    }
  }

  openModal() {
    this.modalRef = this.modalService.show(this.downloadModal, {class: 'modal-lg'});
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  @Input() set settings(settings: ISettingResultList) {
    this._settings = settings;
    if (settings && settings.selected) {
      this._originalSelected = [...settings.selected];
      this.columnSelector.columns = settings.selected;
    }
  }

  get settings() {
    return this._settings;
  }

  @Input() set query(query: WarehouseQueryInterface) {
    this._originalQuery = query;
    if (!query) {
      return;
    }
    let hasPersonalData = false;
    const warehouseQuery: WarehouseQueryInterface = {...query};
    ['editorPersonToken', 'observerPersonToken', 'editorOrObserverPersonToken', 'editorOrObserverIsNotPersonToken'].forEach(key => {
      if (warehouseQuery[key]) {
        hasPersonalData = true;
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
    this.observationDataService.getData(this._originalQuery).pipe(
      map(data => data.private.total),
      catchError(() => this.warehouseService.warehouseQueryCountGet({
        ...this.query,
        secured: true
      }).pipe(
        map(result => result.total)
      ))
    ).subscribe(total => {
      this.privateCount = total;
      this.cd.markForCheck();
    });
  }

  updateCsvLink() {
    const queryParams = this.searchQuery.getQueryObject(this.query);
    queryParams['aggregateBy'] = this.taxaDownloadAggregateBy[this.translate.currentLang];
    queryParams['includeNonValidTaxa'] = 'false';
    queryParams['pageSize'] = '' + this.taxaLimit;
    queryParams['format'] = 'csv';
    const params = new HttpParams({fromObject: <any>queryParams});
    this.csvParams = params.toString();
  }

  updateQueryParamsDownloadTaxon(e) {
    e.stopPropagation();
    const arrayParams = this.csvParams.split('&');
    ['editorPersonToken', 'observerPersonToken', 'editorOrObserverPersonToken', 'editorOrObserverIsNotPersonToken'].forEach(key => {
      arrayParams.forEach((element, index) => {
        if (element.indexOf(key) !== -1) {
          arrayParams[index] = key + '=' + this.userService.getToken();
        }
      });
    });

    this.csvParams = arrayParams.join('&');
    this.linkTimeout = setTimeout(() => {
      this.updateCsvLink();
    }, 200);
  }

  downloadSpecies(e) {
    this.speciesCsvLoading = true;
    this.cd.markForCheck();
    this.updateQueryParamsDownloadTaxon(e);
    this.downloadService.downloadTextFile(environment.apiBase + '/warehouse/query/aggregate?' + this.csvParams, 'species.csv').subscribe(() => {
      this.speciesCsvLoading = false;
      this.cd.markForCheck();
    });
  }

  makePrivateRequest() {
    this.makeRequest('downloadApprovalRequest');
  }

  makePublicRequest(requireReason = false) {
    if (requireReason && !this.reason) {
      return;
    }
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
      this.translate.currentLang,
      undefined,
      {
        dataUsePurpose: this.reason
      }
    ).subscribe(
      () => {
        this.toastsService.showSuccess(this.translate.instant(type === 'download' ?
          'result.load.thanksPublic' : 'result.load.thanksRequest'
        ));
        this.requests[type] = RequestStatus.done;
        this.closeModal();
        this.cd.markForCheck();
      },
      err => {
        this.requests[type] = RequestStatus.error;
        this.toastsService.showError(this.translate.instant(err && err.status ?
          'observation.download.limitExceededException' :
          'observation.download.error'
        ));
        this.logger.warn('Failed to make download request', err);
        this.cd.markForCheck();
      }
    );
  }

  simpleDownload(type: any) {
    this.downloadLoading = true;
    const selected = this.columnSelector.columns;
    const columns = this.tableColumnService.getColumns(selected);
    this.observationResultService.getAll(
      this._originalQuery,
      this.tableColumnService.getSelectFields(selected, this.query),
      [],
      this.translate.currentLang,
      true,
      environment.type === Global.type.vir,
      [this.reasonEnum, this.reason].filter(r => !!r).join(': ')
    ).pipe(
      switchMap(data => this.exportService.exportFromData(data, columns, type as BookType, 'laji-data'))
    ).subscribe(
      () => {
        this.downloadLoading = false;
        // see https://github.com/valor-software/ngx-bootstrap/issues/2618
        for (let i = 1; i <= this.modalService.getModalsCount(); i++) {
          this.modalService.hide(i);
        }
        this.cd.markForCheck();
      },
      (err) => {
        this.logger.error('Simple download failed', err);
        this.toastsService.showError(this.translate.instant('observation.download.error'));
        this.downloadLoading = false;
      }
    );
  }

  openColumnSelectModal() {
    this.settingsModal.openModal();
  }

  onCloseColumnSettingsModal(ok: boolean) {
    if (ok) {
      this._originalSelected = [...this.columnSelector.columns];
      this.settingsChange.emit({
        ...this._settings,
        selected: this.columnSelector.columns
      });
    } else {
      this.columnSelector.columns = [...this._originalSelected];
    }
  }

  resetColumnSelects() {
    this.columnSelector.columns = this.tableColumnService.getDefaultFields();
  }
}
