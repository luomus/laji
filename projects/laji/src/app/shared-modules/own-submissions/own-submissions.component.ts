import { catchError, concatMap, map, mergeMap, share, switchMap, tap, toArray } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy, OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, forkJoin as ObservableForkJoin, from as ObservableFrom, Observable, of as ObservableOf, Subscription } from 'rxjs';
import { LocalStorage } from 'ngx-webstorage';
import { DocumentExportService } from './service/document-export.service';
import { DownloadEvent, LabelEvent, RowDocument } from './own-datatable/own-datatable.component';
import { DocumentInfoService } from '../../shared/service/document-info.service';
import * as moment from 'moment';
import { FormService } from '../../shared/service/form.service';
import { TriplestoreLabelService } from '../../shared/service/triplestore-label.service';
import { Logger } from '../../shared/logger';
import { ToastsService } from '../../shared/service/toasts.service';
import { DocumentService } from './service/document.service';
import { PdfLabelService } from '../../shared/service/pdf-label.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { Router } from '@angular/router';
import { Global } from '../../../environments/global';
import { DocumentViewerFacade } from '../document-viewer/document-viewer.facade';
import { LatestDocumentsFacade } from '../latest-documents/latest-documents.facade';
import { DeleteOwnDocumentService } from '../../shared/service/delete-own-document.service';

interface DocumentQuery {
  year?: string;
  onlyTemplates?: boolean;
  namedPlace?: string;
  collectionID?: string;
  formID?: string;
  selectedFields?: string;
}

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css'],
  providers: [DocumentExportService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnSubmissionsComponent implements OnChanges, OnInit, OnDestroy {

  @Input() collectionID;
  @Input() formID;
  @Input() showDownloadAll = true;
  @Input() showPrintLabels = false;
  @Input() admin = false;
  @Input() useInternalDocumentViewer = false;
  @Input() actions: string[]|false = ['edit', 'view', 'download', 'stats', 'delete'];
  @Input() columns = ['dateEdited', 'dateObserved', 'locality', 'gatheringsCount', 'unitCount', 'observer', 'form', 'id', 'publicityRestrictions'];
  @Input() columnNameMapping: any;
  @Input() templateColumns = ['templateName', 'templateDescription', 'dateEdited', 'form', 'id'];
  @Input() onlyTemplates = false;
  @Input() namedPlace: string;
  @Input() header: string;
  @Input() forceLocalDocument = false;
  @Input() reload$?: Observable<void>;

  @Output() documentsLoaded = new EventEmitter<RowDocument[]>();

  publicity = Document.PublicityRestrictionsEnum;

  documents$: Observable<RowDocument[]>;
  private documents: RowDocument[];
  loading = true;
  reloadSubscription$: Subscription;
  subscriptionDeleteOwnDocument: Subscription;

  @LocalStorage('own-submissions-year', '') year: string;
  yearInfo$: Observable<any[]>;

  yearInfoError: string;
  documentError: string;
  selectedFields = 'creator,id,gatherings[*].id,publicityRestrictions,formID';

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
    publicityRestrictions: 'publicityRestrictions'
  };

  constructor(
    private documentApi: DocumentApi,
    private userService: UserService,
    private translate: TranslateService,
    private documentExportService: DocumentExportService,
    private documentService: DocumentService,
    private formService: FormService,
    private labelService: TriplestoreLabelService,
    private toastService: ToastsService,
    private logger: Logger,
    private cd: ChangeDetectorRef,
    private pdfLabelService: PdfLabelService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router,
    private documentViewerFacade: DocumentViewerFacade,
    private latestFacade: LatestDocumentsFacade,
    private deleteOwnDocument: DeleteOwnDocumentService,
  ) {
    this.selectedMap.taxon += ',' + Global.documentCountUnitProperties.map(prop => 'gatherings.units.' + prop).join(',');
    if (!this.year) {
      this.year = '' + new Date().getFullYear();
    }
  }

  ngOnInit() {
    this.reloadSubscription$ = this.reload$?.subscribe(() => {
      this.initDocuments(this.onlyTemplates);
      this.cd.markForCheck();
    });

    this.subscriptionDeleteOwnDocument = this.deleteOwnDocument.childEventListner().subscribe(id => {
      if (id !== null) {
        this.documents = this.documents.filter(doc => doc.id !== id);
        this.documentsLoaded.emit(this.documents);
        this.cd.markForCheck();
        this.latestFacade.update();
      }
    });
  }

  ngOnDestroy() {
    this.reloadSubscription$?.unsubscribe();
    this.subscriptionDeleteOwnDocument?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initDocuments(this.onlyTemplates);
  }

  sliderRangeChange(newYear: string) {
    this.year = newYear;
    this.initDocuments(true);
  }

  onDocumentClick(docID: string) {
    this.documentViewerFacade.showRemoteDocument({
      document: docID,
      own: true,
      forceLocal: this.forceLocalDocument
    });
  }

  private initDocuments(onlyDocuments = false) {
    this.loading = true;

    if (this.namedPlace) {
      this.documents$ = this.getAllDocuments<Document>({
        year: undefined,
        namedPlace: this.namedPlace,
        collectionID: this.collectionID,
        formID: this.formID,
        selectedFields: this.getSelectedFields()
      }).pipe(
        switchMap(documents => this.searchDocumentsToRowDocuments(documents)),
        tap((documents) => {
          this.documents = documents;
          this.loading = false;
          this.cd.markForCheck();
          this.documentsLoaded.emit(documents);
        })
      );
      return;
    }

    if (!onlyDocuments) {
      const yearInfoQuery: any = {
        collectionID: this.collectionID,
        formID: this.formID
      };
      this.yearInfo$ = this.documentApi.countByYear(this.userService.getToken(), yearInfoQuery).pipe(
        map(results => results.reverse()),
        tap((results: any[]) => {
          if (this.year && results.findIndex(item => item.year === this.year) > -1) {
            return;
          }
          this.year = results.length > 0 && (results.length !== 1 && results[0].year !== 'null')
            ? results[0].year
            : new Date().getFullYear();
        }),
        catchError(() => {
          this.translate.get('haseka.form.genericError')
            .subscribe(msg => {
              this.yearInfoError = msg;
              this.cd.markForCheck();
            });
          return ObservableOf([]);
        }),
        share()
      );
    }

    this.documents$ = (onlyDocuments ? ObservableOf([]) : this.yearInfo$).pipe(
      switchMap(() => {
        const documentQuery: DocumentQuery = {
          year: this.onlyTemplates ? undefined : this.year,
          onlyTemplates: this.onlyTemplates,
          collectionID: this.collectionID,
          formID: this.formID,
          selectedFields: this.getSelectedFields()
        };
        if (this.namedPlace) {
          documentQuery.namedPlace = this.namedPlace;
        }
        return this.getAllDocuments<Document>(documentQuery);
      }),
      switchMap(documents => this.searchDocumentsToRowDocuments(documents)),
      tap((documents) => {
        this.loading = false;
        this.documents = documents;
        this.documentsLoaded.emit(documents);
        this.cd.markForCheck();
      })
    );
  }

  download(e: DownloadEvent) {
    if (e.documentId) {
      this.documentExportService.downloadDocument(
        this.documentApi.findById(e.documentId, this.userService.getToken()), e.fileType
      );
    } else {
      this.documentExportService.downloadDocuments(
        this.getAllDocuments<Document>({year: this.year}), 1, e.fileType
      );
    }
  }

  delete(docId: string) {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.documentService.deleteDocument(docId)
      .subscribe(
        () => {
          this.translate.get('delete.success')
            .subscribe((value) => this.toastService.showSuccess(value));
          this.loading = false;
          this.documents = this.documents.filter(doc => doc.id !== docId);
          this.documentsLoaded.emit(this.documents);
          this.cd.markForCheck();
          this.latestFacade.update();
        },
        (err) => {
          this.translate.get('delete.error')
            .subscribe((value) => this.toastService.showError(value));
          this.initDocuments(this.onlyTemplates);
          this.logger.error('Deleting failed', err);
          this.loading = false;
          this.cd.markForCheck();
        }
      );
  }

  private getSelectedFields() {
    const selected = [this.selectedFields];
    const cols = this.onlyTemplates ? this.templateColumns : this.columns;
    cols.forEach(col => {
      if (this.selectedMap[col]) {
        this.selectedMap[col].split(',').forEach(field => {
          if (selected.indexOf(field) === -1) {
            selected.push(field);
          }
        });
      } else {
        this.logger.log('Cannot determinate which fields should be selected for "' + col + '" in OwnSubmissionsComponent');
      }
    });
    return selected.join(',');
  }

  private getAllDocuments<T>(
    query: DocumentQuery = {},
    page = 1,
    documents = []
  ): Observable<T[]> {
    const _query: any = {
      templates: query.onlyTemplates ? 'true' : undefined,
      collectionID: query.collectionID,
      formID: query.formID,
      selectedFields: query.selectedFields
    };
    if (this.namedPlace) {
      _query.namedPlace = this.namedPlace;
    }
    if (query.year) {
      _query.observationYear = String(query.year);
    }
    return this.documentApi.findAll(
      this.userService.getToken(),
      String(page),
      String(10000),
      _query
    ).pipe(
      switchMap(result => {
        documents.push(...result.results);
        if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
          return this.getAllDocuments<T>(query, result.currentPage + 1, documents);
        } else {
          return ObservableOf(documents);
        }
      }),
      catchError(() => {
        this.translate.get(query.year ? 'haseka.submissions.loadError' : 'np.loadError', {year: query.year})
          .subscribe(msg => {
            this.documentError = msg;
          });
        return ObservableOf([]);
      })
    );
  }

  private searchDocumentsToRowDocuments(documents: Document[]): Observable<RowDocument[]> {
    return Array.isArray(documents) && documents.length > 0 ?
      forkJoin(documents.map((doc, i) => this.setRowData(doc, i))) :
      ObservableOf([]);
  }

  private setRowData(document: Document, idx: number): Observable<RowDocument> {
    return this.getForm(document.formID).pipe(
      switchMap((form) => {
        const gatheringInfo = DocumentInfoService.getGatheringInfo(document, form);
        return ObservableForkJoin(
          this.getObservers(document.gatheringEvent && document.gatheringEvent.leg),
          this.getNamedPlaceName(document.namedPlaceID),
          this.getTaxon(gatheringInfo.taxonID, gatheringInfo)
        ).pipe(
          map<any, RowDocument>(([observers, npName, taxon]) => {
            const dateObservedEnd = gatheringInfo.dateEnd ? moment(gatheringInfo.dateEnd).format('DD.MM.YYYY') : '';
            let dateObserved = gatheringInfo.dateBegin ? moment(gatheringInfo.dateBegin).format('DD.MM.YYYY') : '';
            if (dateObservedEnd && dateObservedEnd !== dateObserved) {
              dateObserved += ' - ' + dateObservedEnd;
            }
            return {
              creator: document.creator,
              templateName: document.templateName,
              templateDescription: document.templateDescription,
              publicity: document.publicityRestrictions as any,
              dateEdited: document.dateEdited ? moment(document.dateEdited).format('DD.MM.YYYY HH:mm') : '',
              dateObserved,
              dateCreated: dateObserved,
              namedPlaceName: npName,
              locality: this.getLocality(gatheringInfo),
              gatheringsCount: document.gatherings?.length || 0,
              unitCount: gatheringInfo.unitList.length,
              observer: observers,
              taxon,
              formID: document.formID,
              form: form.title || document.formID,
              id: document.id,
              publicityRestrictions:
                document.publicityRestrictions === Document.PublicityRestrictionsEnum.publicityRestrictionsPublic
                  ? this.translate.instant('haseka.submissions.publicityRestrictions.public')
                  : document.publicityRestrictions === Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate
                    ? this.translate.instant('haseka.submissions.publicityRestrictions.private')
                    : this.translate.instant('haseka.submissions.publicityRestrictions.protected'),
              locked: !!document.locked,
              index: idx,
              _editUrl: this.formService.getEditUrlPath(document.formID, document.id),
            } as RowDocument;
          })
        );
      })
    );
  }

  private getLocality(gatheringInfo: any): string {
    return DocumentInfoService.getLocality(gatheringInfo) || this.translate.instant('haseka.users.latest.localityMissing');
  }

  private getObservers(userArray: string[] = []): Observable<string> {
    return ObservableFrom(userArray).pipe(
      concatMap(personId => this.userService.getPersonInfo(personId)),
      toArray(),
      map((array) => array.join(', '))
    );
  }

  private getForm(formId: string): Observable<any> {
    return this.formService.getFormInListFormat(formId).pipe(
      map(form => form || {id: formId}),
      catchError((err) => {
        this.logger.error('Failed to load form ' + formId, err);
        return ObservableOf({id: formId});
      }));
  }

  private getNamedPlaceName(npId: string): Observable<string> {
    if (!npId || this.columns.indexOf('namedPlaceName') === -1) { return ObservableOf(''); }
    return this.labelService.get(npId, 'multi');
  }

  private getTaxon(taxonId: string[], gatheringInfo: any): Observable<string> {
    if (!taxonId || !taxonId.length || this.columns.indexOf('taxon') === -1 ||
    (gatheringInfo && gatheringInfo.unitList && gatheringInfo.unitList.length > 1)) { return ObservableOf(''); }
    return this.labelService.get(taxonId[0], 'multi').pipe(
      map(langResult => langResult[this.translate.currentLang])
    );
  }

  doLabels(event: LabelEvent) {
    this.loading = true;
    const documents$ = ObservableForkJoin(
      event.documentIDs.map(id => this.documentApi.findById(id, this.userService.getToken()))
    );
    const year$ = this.getAllDocuments<Document>({year: event.year}).pipe(
      map(documents => documents.filter(doc => event.documentIDs.indexOf(doc.id) > -1))
    );
    (event.documentIDs.length > 10 ? year$ : documents$).pipe(
      mergeMap(docs => this.pdfLabelService.setData(docs, event.filter)),
      tap(() => {
        this.loading = false;
        this.router.navigate(this.localizeRouterService.translateRoute(['/vihko/tools/label']));
      })
    ).subscribe();
  }
}
