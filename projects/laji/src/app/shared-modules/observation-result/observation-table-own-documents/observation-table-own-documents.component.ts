import { catchError, toArray, concatMap, share ,  map, switchMap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  OnDestroy
} from '@angular/core';
import * as moment from 'moment';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Document } from '../../../shared/model/Document';
import { ObservationResultService } from '../service/observation-result.service';
import { PagedResult } from '../../../shared/model/PagedResult';
import { ObservationTableColumn } from '../model/observation-table-column';
import { BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of, Subscription, forkJoin, from as ObservableFrom, forkJoin as ObservableForkJoin, of as ObservableOf } from 'rxjs';
import { DatatableOwnSubmissionsComponent } from '../../datatable/datatable-own-submissions/datatable-own-submissions.component';
import { Logger } from '../../../shared/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';
import { UserService } from '../../../shared/service/user.service';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import {
  IColumnGroup,
  TableColumnService
} from '../../datatable/service/table-column.service';
import { FormService } from '../../../shared/service/form.service';
import { ExportService } from '../../../shared/service/export.service';
import { BookType } from 'xlsx';
import { Global } from '../../../../environments/global';
import { IColumns } from '../../datatable/service/observation-table-column.service';
import { OwnObservationTableSettingsComponent } from './own-observation-table-settings.component';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { TemplateForm } from '../../own-submissions/models/template-form';
import { ToQNamePipe } from 'projects/laji/src/app/shared/pipe/to-qname.pipe';
import { RowDocument } from '../../own-submissions/own-datatable/own-datatable.component';
import { DocumentInfoService } from '../../../shared/service/document-info.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { DeleteOwnDocumentService } from '../../../shared/service/delete-own-document.service';


@Component({
  selector: 'laji-observation-table-own-documents',
  templateUrl: './observation-table-own-documents.component.html',
  styleUrls: ['./observation-table-own-documents.component.scss'],
  providers: [ObservationResultService, ToQNamePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationTableOwnDocumentsComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('dataTableOwn', { static: true }) public datatable: DatatableOwnSubmissionsComponent;
  @ViewChild(OwnObservationTableSettingsComponent, { static: true }) public settingsModalOwn: OwnObservationTableSettingsComponent;

  @Input() query: WarehouseQueryInterface;
  @Input() overrideInQuery: WarehouseQueryInterface;
  @Input() pageSize;
  @Input() page = 1;
  @Input() isAggregate = true;
  @Input() height = '100%';
  @Input() showSettingsMenu = false;
  @Input() showDownloadMenu = false;
  @Input() showPageSize = true;
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() virtualScrolling = true;
  @Input() defaultOrder: string;
  @Input() visible: boolean;
  @Input() hideDefaultCountColumn = false;
  @Input() allAggregateFields = [
    'document.createdDate',
      'document.documentId',
      'document.formId',
      'document.loadDate',
      'document.namedPlace.id',
      'gathering.locality',
      'gathering.municipality',
      'gathering.linkings.observers'
  ];
  @Input() useStatistics: boolean;

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectChange = new EventEmitter<string[]>();
  @Output() resetColumns = new EventEmitter<void>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() total = new EventEmitter<number>();

  maxDownload = Global.limit.simpleDownload;
  downloadLoading = false;
  lang: string;
  cache: any = {};
  orderBy: string[] = [];
  columnLookup = {};
  _originalSelected: string[] = [];
  _originalSelectedNumbers: string[] = [];
  showDownloadAll = true;
  showPrintLabels = false;
  newColumns = ['dateEdited', 'dateCreated', 'locality', 'form', 'id', 'observer'];
  allColumnsNew = [
    {prop: 'templateName', mode: 'small'},
    {prop: 'templateDescription', mode: 'small'},
    {prop: 'dateEdited', mode: 'small'},
    {prop: 'dateCreated', mode: 'large'},
    {prop: 'namedPlaceName', mode: 'large'},
    {prop: 'locality', mode: 'medium'},
    {prop: 'taxon', mode: 'medium'},
    {prop: 'gatheringsCount', mode: 'large'},
    {prop: 'unitCount', mode: 'small'},
    {prop: 'observer', mode: 'large'},
    {prop: 'form', mode: 'large'},
    {prop: 'id', mode: 'large'}
  ];

  columnSelector = new ColumnSelector;
  numberColumnSelector = new ColumnSelector;
  subscriptionDeleteOwnDocument: Subscription;
  childEvent: any;

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  loading: boolean;

  private langMap = {
    'fi': 'Finnish',
    'sv': 'Swedish',
    'en': 'English'
  };

  columns: ObservationTableColumn[] = [];
  allColumns: ObservationTableColumn[];
  columnGroups: IColumnGroup<IColumns>[][];

  private numberFields = ['oldestRecord', 'newestRecord', 'count', 'individualCountMax', 'individualCountSum', 'pairCountSum'];

  private modalSub: Subscription;
  private fetchSub: Subscription;
  private fetchSubGiorgio: Subscription;
  private queryKey: string;
  private aggregateBy: string[] = [];
  templateForm: TemplateForm = {
    name: '',
    description: '',
    type: 'gathering'
  };

  selectedMap = {
    id: 'id',
    templateName: 'templateName',
    templateDescription: 'templateDescription',
    dateEdited: 'dateEdited',
    form: 'formID',
    dateObserved: 'gatheringEvent.dateEnd,gatheringEvent.dateBegin,gatherings.dateBegin,gatherings.dateEnd',
    locality: 'gatherings.locality,namedPlaceID,gatherings.namedPlaceID,gatherings.municipality',
    unitCount: 'gatherings.units',
    observer: 'gatheringEvent.leg',
    namedPlaceName: 'namedPlaceID,gatherings.namedPlaceID',
    taxon: 'gatherings.units.identifications.taxonID',
  };


  @Input() showRowAsLink = true;

  constructor(
    private resultService: ObservationResultService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private logger: Logger,
    private translate: TranslateService,
    private tableColumnService: TableColumnService<ObservationTableColumn, IColumns>,
    private exportService: ExportService,
    private warehouseApi: WarehouseApi,
    private toQName: ToQNamePipe,
    private formService: FormService,
    private documentInfoService: DocumentInfoService,
    private labelService: TriplestoreLabelService,
    private userService: UserService,
    private documentApi: DocumentApi,
    private deleteOwnDocument: DeleteOwnDocumentService,
  ) {
    this.allColumns = tableColumnService.getAllColumns();
    this.columnGroups = tableColumnService.getColumnGroups();
  }

  @Input() set selected(sel: string[]) {
    const selected = [];
    const selectedNumbers = [];
    sel.map(field => {
      if (this.numberFields.indexOf(field) > -1) {
        selectedNumbers.push(field);
      } else {
        if (this.allColumns.find((col) => col.name === field)) {
          selected.push(field);
        }
      }
    });

    this._originalSelected = [...selected];
    this._originalSelectedNumbers = [...selectedNumbers];

    this.columnSelector.columns       = selected;
    this.numberColumnSelector.columns = selectedNumbers;
  }

  @Input() set required(required: string[]) {
    this.columnSelector.required = required;
  }

  ngOnInit() {
    this.lang = this.translate.currentLang;
    this.initColumns();
    this.fetchPageGiorgio(this.page);

    this.subscriptionDeleteOwnDocument = this.deleteOwnDocument.childEventListner().subscribe(info => {
      this.childEvent = info;
      if (this.childEvent !== null) {
        setTimeout(() => {
          this.initColumns();
          this.fetchPageGiorgio(this.page);
          this.subscriptionDeleteOwnDocument.unsubscribe();
        }, 1300);
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      this.initColumns();
      this.fetchPageGiorgio(changes.page ? this.page : 1);
    }
    if ((changes.query && !changes.query.isFirstChange())
        || (changes.page && !changes.page.isFirstChange())
        || (changes.pageSize && !changes.pageSize.isFirstChange())) {
      this.fetchPageGiorgio(changes.page ? this.page : 1);
    }
    if (changes.visible && this.visible) {
      this.refreshTable();
    }
  }

  ngOnDestroy() {
    this.subscriptionDeleteOwnDocument.unsubscribe();
  }

  refreshTable() {
    this.datatable?.refreshTable();
  }

  initColumns() {
    this.columns = [];
    const selected = this.isAggregate ?
      (this.hideDefaultCountColumn ?
        [...this.columnSelector.columns, ...this.numberColumnSelector.columns] :
        [...this.columnSelector.columns, 'count', ...this.numberColumnSelector.columns]) :
      [...this.columnSelector.columns];

    this.columnLookup = this.allColumns
      .reduce((prev, column) => {
        prev[column.name] = column;
        return prev;
      }, {});

    this.aggregateBy = [];

    // this.columns.push({name: 'buttons', label: 'Buttons', sortable: false})
    this.allColumnsNew.map(col => {
      if (this.newColumns.indexOf(col['prop']) > -1) {
        this.columns.push(col);
      }
    });
  }

  openModal() {
    this.settingsModalOwn.openModal();
  }

  onCloseSettingsModal(ok: boolean) {
    if (!ok) {
      this.columnSelector.columns = [...this._originalSelected];
      this.numberColumnSelector.columns = [...this._originalSelectedNumbers];
    } else if (this.columnSelector.hasChanges || this.numberColumnSelector.hasChanges) {
      this.orderBy = [];
      this.selectChange.emit([...this.columnSelector.columns, ...this.numberColumnSelector.columns]);
    }
  }

  onReorder(event) {
    if (
      !event.column ||
      !event.column.name ||
      !this.columnSelector.hasField(event.column.name) ||
      typeof event.newValue !== 'number' ||
      typeof event.prevValue !== 'number'
    ) {
      return;
    }
    this.columnSelector.moveFieldByIndex(event.prevValue, event.newValue);
    this.selectChange.emit([...this.columnSelector.columns, ...this.numberColumnSelector.columns]);
  }

  clear() {
    this.columnSelector.clear();
    this.numberColumnSelector.clear();
  }

  setPage(pageInfo) {
    this.fetchPageGiorgio(pageInfo.offset + 1);
  }

  onSort(event) {
    this.orderBy = event.sorts.map(sort => {
      const col = this.columns.filter(column => column.prop === sort.prop)[0];
      if (!col) {
        return '';
      }
      const sortBy: string =  this.setLangParams(col.sortBy || '' + col.prop);
      return sortBy.split(',').map(val => val + ' ' + sort.dir.toUpperCase()).join(',');
    });
    this.fetchPageGiorgio(this.page);
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }

  fetchPage(page = 1) {
    if (!this.pageSize) {
      return;
    }
    const queryKey = JSON.stringify(this.query) + [this.pageSize, page].join(':');
    if (this.loading && this.queryKey === queryKey) {
      return;
    }
    this.queryKey = queryKey;
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }
    this.loading = true;
    this.changeDetectorRef.markForCheck();
    const list$ = this.warehouseApi.warehouseQueryListGet(
      this.query,
      this.getSelectFields(this.columnSelector.columns, this.query),
      ['document.modifiedDate DESC'],
      this.pageSize,
      page,
      true
    );

    this.fetchSub = list$
        .subscribe(data => {

        const ids = data.results.map(obj => this.toQName.transform(obj['document']['documentId']) );
        data.results.forEach((element, index) => {
          element['document']['documentId'] = ids[index];
        });
        this.total.emit(data && data.results.length || 0);
        data.total = data.results.length;
        this.result = data;
        this.loading = false;
        // This needs to be markForCheck and not detectChanges otherwise observation table on taxon section will not work
        this.changeDetectorRef.markForCheck();
      }, () => {
        this.total.emit(0);
        this.loading = false;
        this.changeDetectorRef.markForCheck();
        this.logger.error('Observation table data handling failed!', this.query);
      });
  }

  fetchPageGiorgio(page = 1) {
    this.query = {...this.query, ...this.overrideInQuery};
    if (!this.pageSize) {
      return;
    }
    const queryKey = JSON.stringify(this.query) + [this.pageSize, page].join(':');
    if (this.loading && this.queryKey === queryKey) {
      return;
    }
    this.queryKey = queryKey;
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }
    this.loading = true;
    this.changeDetectorRef.markForCheck();

    this.warehouseApi.warehouseQueryAggregateGet(
      this.query,
      [
      'document.createdDate',
      'document.documentId',
      'document.formId',
      'document.loadDate',
      'document.namedPlace.id',
      'gathering.locality',
      'gathering.municipality',
      'gathering.team',

      ],
      ['document.loadDate DESC'],
      100,
      page,
      false,
      false
    ).pipe(
      map(res => res.results),
      switchMap((documents: Document[]) => this.searchDocumentsToRowDocuments(documents))
    )
    .subscribe(data => {
      data = Array.from(new Set(data));
      data = this.dedupeByKey(data, 'id');
      this.total.emit(data && data.length || 0);
      // data.total = data.length;
      this.result.results = data;
      this.result.total = data.length;
      this.result.pageSize = this.pageSize;
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }, () => {
      this.total.emit(0);
      this.loading = false;
      this.changeDetectorRef.markForCheck();
      this.logger.error('Observation table data handling failed!', this.query);
    });

  }

  private getSingleDocument(documentId) {
   // return this.warehouseApi.warehouseQuerySingleGet(documentId);
   return this.documentApi.findById(this.toQName.transform(documentId), this.userService.getToken());
  }

  private searchDocumentsToRowDocuments(documents: Document[]): Observable<any[]> {
    // documents.map(document => document['document']);
    return Array.isArray(documents) && documents.length > 0 ?
      forkJoin(documents.map((doc, i) => this.setRowData(doc, i))) :
      ObservableOf([]);
  }

  private setRowData(document: Document, idx: number): any {
    return this.getForm(this.toQName.transform(document['aggregateBy']['document.formId'])).pipe(
      switchMap((form) => {
        const gatheringInfo = DocumentInfoService.getGatheringInfo(document, form);
        return ObservableForkJoin(
          this.getLocality(gatheringInfo, document)
        ).pipe(
          map<any, RowDocument>(([locality, npName]) => {
            const dateObservedEnd = gatheringInfo.dateEnd ? moment(gatheringInfo.dateEnd).format('DD.MM.YYYY') : '';
            let dateObserved = gatheringInfo.dateBegin ? moment(gatheringInfo.dateBegin).format('DD.MM.YYYY') : '';
            if (dateObservedEnd && dateObservedEnd !== dateObserved) {
              dateObserved += ' - ' + dateObservedEnd;
            }
            return {
              creator: '',
              templateName: {},
              templateDescription: {},
              publicity: {},
              dateEdited: document['aggregateBy']['document.loadDate'] ? moment(document['aggregateBy']['document.loadDate']).format('DD.MM.YYYY') : '',
              dateObserved: document['aggregateBy']['document.createdDate'] ? moment(document['aggregateBy']['document.createdDate']).format('DD.MM.YYYY') : '',
              dateCreated: document['aggregateBy']['document.createdDate'] ? moment(document['aggregateBy']['document.createdDate']).format('DD.MM.YYYY') : '',
              namedPlaceName: document['aggregateBy']['namedPlace.id'],
              locality: this.createLocality(document['aggregateBy']['gathering.locality'], document['aggregateBy']['gathering.municipality']),
              gatheringsCount: null,
              unitCount: document['count'],
              observer: this.toQName.transform(document['aggregateBy']['gathering.team']),
              formID: document['aggregateBy']['document.formId'],
              form: form.title || document['aggregateBy']['document.formId'],
              id: this.toQName.transform(document['aggregateBy']['document.documentId']),
              locked: true,
              index: idx,
              _editUrl: this.formService.getEditUrlPath(
                this.toQName.transform(document['aggregateBy']['document.formId']), this.toQName.transform(document['aggregateBy']['document.documentId'])
              ),
            } as RowDocument;
          })
        );
      })
    );
  }

  private createLocality(locality, municipality) {
    if (!locality && !municipality) {
      return this.translate.instant('np.localityNotSet');
    } else {
      if (!locality) {
        return municipality;
      } else if (!municipality) {
        return locality;
      }

      return municipality + ', ' + locality;
    }
  }

  private getForm(formId: string): Observable<any> {
    return this.formService.getForm(formId, this.translate.currentLang).pipe(
      map(form => form || {id: formId}),
      catchError((err) => {
        this.logger.error('Failed to load form ' + formId, err);
        return ObservableOf({id: formId});
      }));
  }

  private getLocality(gatheringInfo: any, document): Observable<string> {
    return getLocality$(this.translate, this.labelService, gatheringInfo, document);
  }

  private getObservers(userArray: string[] = []): Observable<string> {
    return ObservableFrom(userArray).pipe(
      concatMap(personId => this.userService.getPersonInfo(personId)),
      toArray(),
      map((array) => array.join(', '))
    );
  }

  private getSelectFields(selected: string[], query: WarehouseQueryInterface) {
    const selects = selected.map(field => this.columnLookup[field].selectField || field);
    if (query.editorPersonToken || query.observerPersonToken || query.editorOrObserverPersonToken) {
      selects.push('document.quality,gathering.quality,unit.quality');
    }
    return selects;
  }

  private setLangParams(value: string) {
    return (value || '')
      .replace(/%longLang%/g, this.langMap[this.lang] || 'Finnish');
  }

  download(type: string) {
    this.downloadLoading = true;
    const columns = this.tableColumnService.getColumns(this._originalSelected);
    this.resultService.getAll(
      this.query,
      this.tableColumnService.getSelectFields(this.columnSelector.columns, this.query),
      [...this.orderBy, this.defaultOrder],
      this.lang
    ).pipe(
      switchMap(data => this.exportService.exportFromData(data, columns, type as BookType, 'laji-data'))
    ).subscribe(
      () => {
        this.downloadLoading = false;
        this.changeDetectorRef.markForCheck();
      },
      (err) => this.logger.error('Simple download failed', err));
  }

  private dedupeByKey(arr, key) {
    const temp = arr.map(el => el[key]);
    return arr.filter((el, i) =>
      temp.indexOf(el[key]) === i
    );
  }


}

export function getLocality$(translate: TranslateService,
  labelService: TriplestoreLabelService,
  gatheringInfo: any,
  document: any): Observable<string> {
let locality$ = ObservableOf(gatheringInfo);
const npID = gatheringInfo.namedPlaceID || document.namedPlaceID;

    if (gatheringInfo.locality && gatheringInfo.municipality) {
      locality$ = ObservableOf({...gatheringInfo, locality: gatheringInfo.municipality + ', ' + gatheringInfo.locality});
    }

    if (!gatheringInfo.locality && npID) {
    locality$ = labelService.get(npID, 'multi').pipe(
    map(namedPlace => ({...gatheringInfo, locality: namedPlace})));
    }

    const {gatherings = []} = document;
    if (!gatheringInfo.locality) {
    if (document.npID) {
    locality$ = labelService.get(npID, 'multi').pipe(
      map(namedPlace => ({...gatheringInfo, locality: namedPlace})));
      } else if (gatherings[0] && gatherings[0].municipality) {
      locality$ = ObservableOf({...gatheringInfo, municipality: gatherings[0].municipality});
      }
    }

return locality$.pipe(
switchMap((gathering) => translate.get('haseka.users.latest.localityMissing').pipe(
map(missing => gathering.locality || gathering.municipality || missing))));
}
