import { first, map, switchMap, tap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SearchQueryService } from '../search-query.service';
import { UserSettingsResultList, UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { ToastsService } from '../../shared/service/toasts.service';
import { Logger } from '../../shared/logger/logger.service';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { HttpParams } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';
import { ObservationResultService } from '../../shared-modules/observation-result/service/observation-result.service';
import { IColumnGroup, TableColumnService } from '../../shared-modules/datatable/service/table-column.service';
import { ExportFileType, ExportService } from '../../shared/service/export.service';
import { Global } from '../../../environments/global';
import { DownloadComponent, DownloadParams } from '../../shared-modules/download-modal/download.component';
import {
  ObservationTableSettingsComponent
} from '../../shared-modules/observation-result/observation-table/observation-table-settings.component';
import { ColumnSelector } from '../../shared/columnselector/ColumnSelector';
import { ObservationTableColumn } from '../../shared-modules/observation-result/model/observation-table-column';
import { IColumns } from '../../shared-modules/datatable/service/observation-table-column.service';
import { ObservationDataService } from '../observation-data.service';
import { environment } from '../../../environments/environment';
import { DownloadService } from '../../shared/service/download.service';
import { ApiKeyRequest } from '../../shared-modules/download-modal/apikey-modal/apikey-modal.component';
import { createActiveFiltersList } from '../../shared-modules/search-filters/active/observation-active.component';
import { FORMAT } from '../../shared-modules/download-modal/download.component';
import { FileFormat, GeoConvertService, isGeoConvertError } from '../../shared/service/geo-convert.service';
import { DialogService } from '../../shared/service/dialog.service';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';
import { PlatformService } from '../../root/platform.service';


enum RequestStatus {
  error = <any> 'error',
  loading = <any> 'loading',
  done = <any> 'done',
}

@Component({
  selector: 'laji-observation-download',
  templateUrl: './observation-download.component.html',
  styleUrls: ['./observation-download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationDownloadComponent implements OnDestroy {

  @ViewChild(ObservationTableSettingsComponent, { static: true }) public settingsModal!: ObservationTableSettingsComponent;
  @ViewChild(DownloadComponent) downloadTypeSelectModal!: DownloadComponent;
  @ViewChild('downloadModal', { static: true }) downloadModal!: TemplateRef<any>;

  @Input() unitCount!: number;
  @Input() speciesCount!: number;
  @Input() taxaLimit = 3000;
  @Input() loadLimit = 2000000;
  @Input() maxSimpleDownload = Global.limit.simpleDownload;

  @Output() settingsChange = new EventEmitter<UserSettingsResultList>();

  privateCount?: number|null;
  hasPersonalData = false;
  requests: {[place: string]: RequestStatus} = {};
  requestStatus = RequestStatus;
  downloadLoading = false;
  downloadProgressPercent?: number;
  apiKeyLoading = false;
  apiKey = '';
  description = '';
  csvParams = '';
  reason = '';
  reasonEnum = '';
  columnSelector = new ColumnSelector();
  columnGroups: IColumnGroup<IColumns>[][];
  columnLookup = {};
  queryHasFilters = false;

  speciesCsvLoading = false;

  linkTimeout: any;

  formats: FORMAT[] = ['tsv', 'ods', 'xlsx', 'gpkg'];

  private _originalSelected: string[];
  private _settings?: UserSettingsResultList|null;
  private modalRef!: ModalRef;
  private cntSub!: Subscription;
  private _query!: WarehouseQueryInterface;
  private _originalQuery!: WarehouseQueryInterface;
  private taxaDownloadAggregateBy = {
    en: 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameEnglish',
    fi: 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameFinnish',
    sv: 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName,unit.linkings.taxon.speciesNameSwedish'
  };
  private gisDownloadGeometryField = 'gathering.conversions.wgs84WKT';

  constructor(
    private platformService: PlatformService,
    public searchQuery: SearchQueryService,
    public userService: UserService,
    public translate: TranslateService,
    private observationResultService: ObservationResultService,
    private toastsService: ToastsService,
    private warehouseService: WarehouseApi,
    private logger: Logger,
    private cd: ChangeDetectorRef,
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>,
    private exportService: ExportService,
    private modalService: ModalService,
    private observationDataService: ObservationDataService,
    private downloadService: DownloadService,
    private geoConvertService: GeoConvertService,
    private dialogService: DialogService
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
    this.modalRef = this.modalService.show(this.downloadModal, {size: 'lg', contentClass: 'laji-page'});
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.hide();
    }
  }

  @Input() set settings(settings: UserSettingsResultList|null|undefined) {
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
      if (warehouseQuery[key as keyof WarehouseQueryInterface]) {
        hasPersonalData = true;
      }
    });
    this._query = warehouseQuery;
    this.hasPersonalData = hasPersonalData;
    this.requests = {};
    this.updateCount();
    this.updateCsvLink();
    this.queryHasFilters = createActiveFiltersList(query).length > 0;
  }

  get query(): WarehouseQueryInterface {
    return this._query;
  }

  updateCount() {
    this.observationDataService.getData(this._originalQuery).pipe(
      map(data => data.securedCount)
    ).subscribe(total => {
      this.privateCount = total;
      this.cd.markForCheck();
    });
  }

  updateCsvLink() {
    const queryParams = this.searchQuery.getQueryObject(this.query);
    queryParams['aggregateBy'] = this.taxaDownloadAggregateBy[this.translate.currentLang as keyof { en: string; fi: string; sv: string }];
    queryParams['includeNonValidTaxa'] = 'false';
    queryParams['pageSize'] = '' + this.taxaLimit;
    queryParams['format'] = 'csv';
    const params = new HttpParams({fromObject: <any>queryParams});
    this.csvParams = params.toString();
  }

  updateQueryParamsDownloadTaxon(e: any) {
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

  downloadSpecies(e: any) {
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
    (this.warehouseService as any)[type](
      this.userService.getToken(),
      'TSV_FLAT',
      'DOCUMENT_FACTS,GATHERING_FACTS,UNIT_FACTS',
      this.query,
      this.translate.currentLang,
      undefined,
      {
        dataUsePurpose: [this.reasonEnum, this.reason].filter(r => !!r).join(': ')
      }
    ).subscribe(
      () => {
        if (type === 'downloadApprovalRequest') {
          this.toastsService.showSuccess(
            this.translate.instant('result.load.thanksRequest'),
            undefined,
            {timeOut: 0, closeButton: true}
          );
        } else {
          this.toastsService.showSuccess(
            this.translate.instant('result.load.thanksPublic')
          );
        }
        this.requests[type] = RequestStatus.done;
        this.closeModal();
        this.cd.markForCheck();
      },
      (err: any) => {
        this.requests[type] = RequestStatus.error;
        this.toastsService.showError(this.translate.instant(err?.status === 429 ?
          'observation.download.limitExceededException' :
          'observation.download.error'
        ));
        this.logger.warn('Failed to make download request', err);
        this.cd.markForCheck();
      }
    );
  }

  simpleDownload(params: DownloadParams) {
    this.downloadLoading = true;
    this.downloadProgressPercent = undefined;
    const isGisDownload = this.isGisDownload(params.fileType);

    let selected = this.columnSelector.columns;
    if (isGisDownload && selected.indexOf(this.gisDownloadGeometryField) === -1) {
      selected = [...selected, this.gisDownloadGeometryField];
    }
    const columns = this.tableColumnService.getColumns(selected);

    this.observationResultService.getAll(
      this._originalQuery,
      this.tableColumnService.getSelectFields(selected, this.query),
      [],
      this.translate.currentLang,
      true,
      environment.type === Global.type.vir || isGisDownload,
      [this.reasonEnum, this.reason].filter(r => !!r).join(': ')
    ).pipe(
      switchMap(data => this.downloadData(data, columns, params))
    ).subscribe(
      () => {
        this.downloadLoading = false;
        this.downloadProgressPercent = undefined;
        this.modalRef.hide();
        this.cd.markForCheck();
      },
      (err) => {
        if (isGeoConvertError(err)) {
          this.dialogService.alert(err.msg);
        } else{
          this.logger.error('Simple download failed', err);
          this.toastsService.showError(this.translate.instant('observation.download.error'));
        }

        this.downloadLoading = false;
      }
    );
  }

  onApiKeyRequest(req: ApiKeyRequest) {
    this.apiKeyLoading = true;
    this.apiKey = '';
    this.warehouseService.download(
      this.userService.getToken(),
      'TSV_FLAT',
      'DOCUMENT_FACTS,GATHERING_FACTS,UNIT_FACTS',
      this.query,
      this.translate.currentLang,
      'AUTHORITIES_API_KEY',
      {
        dataUsePurpose: [req.reasonEnum, req.reason].filter(r => !!r).join(': '),
        apiKeyExpires: req.expiration
      }
    ).subscribe(res => {
      this.apiKeyLoading = false;
      this.apiKey = res.apiKey;
      this.cd.markForCheck();
    }, err => {
      this.logger.error('Apikey request failed', err);
      this.apiKeyLoading = false;
      this.apiKey = '';
      this.cd.markForCheck();
    });
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

  downloadData(data: {id?: string|null; results: any[]}, columns: ObservationTableColumn[], params: DownloadParams): Observable<void> {
    if (this.isGisDownload(params.fileType)) {
      return this.exportService.getBlobFromData(data.results, columns, 'tsv', 'laji-data').pipe(
        map(blob => {
          const formData = new FormData();
          formData.append('file', blob, 'laji-data.tsv');
          return formData;
        }),
        switchMap(formData => this.geoConvertService.geoConvertData(
          formData,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          data.id!,
          params.fileType as FileFormat,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          params.geometry!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          params.crs!
        )),
        tap(response => {
          this.downloadProgressPercent = response.progressPercent;
          this.cd.markForCheck();
        }),
        first(response => response.status === 'complete'),
        map(response => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.platformService.window.location.href = response.outputLink!;
        })
      );
    } else {
      return this.exportService.exportFromData(data.results, columns, params.fileType as ExportFileType, 'laji-data');
    }
  }

  private isGisDownload(fileType: FORMAT): boolean {
    return fileType === 'gpkg';
  }
}
