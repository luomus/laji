import { catchError, map, share, switchMap, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';
import { LocalStorage } from 'ngx-webstorage';
import { DocumentExportService } from './service/document-export.service';
import { DownloadEvent } from './own-datatable/own-datatable.component';

interface DocumentQuery {
  year?: number;
  onlyTemplates?: boolean;
  namedPlace?: string;
  collectionID?: string;
  formID?: string;
  selectedFields?: string;
}

export interface SearchDocument {
  id: string;
  formID: string;
  'gatherings[*].units[*].identifications[*]': string;
  'gatherings[*].units[*].count': string;
  'gatherings[*].units[*].individualCount': number[];
  'gatherings[*].units[*].pairCount': number[];
  'gatherings[*].units[*].abundanceString': string[];
  'gatherings[*].units[*].maleIndividualCount': number[];
  'gatherings[*].units[*].femaleIndividualCount': number[];
  'gatherings[*].units[*].informalNameString': string[];
  'gatherings[*].namedPlaceID': string[];
  'gatherings[*].locality': string[];
  'gatherings[*].id': string[];
  'gatherings[*].dateEnd': string[];
  'gatherings[*].dateBegin': string[];
  'gatheringEvent.dateEnd': string;
  'gatheringEvent.dateBegin': string;
  'namedPlaceID': string;
  'gatheringEvent.leg': string[];
  dateEdited: string;
  publicityRestrictions: string;
  templateDescription: string;
  templateName: string;
  locked: boolean;
  creator: string;
}

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css'],
  providers: [DocumentExportService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnSubmissionsComponent implements OnInit, OnChanges {

  @Input() collectionID;
  @Input() formID;
  @Input() showDownloadAll = true;
  @Input() admin = false;
  @Input() useInternalDocumentViewer = false;
  @Input() actions: string[]|false = ['edit', 'view', 'template', 'download', 'stats', 'delete'];
  @Input() columns = ['dateEdited', 'dateObserved', 'locality', 'unitCount', 'observer', 'form', 'id'];
  @Input() columnNameMapping: any;
  @Input() templateColumns = ['templateName', 'templateDescription', 'dateEdited', 'form', 'id'];
  @Input() onlyTemplates = false;
  @Input() namedPlace: string;
  @Input() header: string;
  @Input() documentViewerGatheringGeometryJSONPath: string;

  @ViewChild('documentModal') public modal: ModalDirective;

  publicity = Document.PublicityRestrictionsEnum;

  documents$: Observable<SearchDocument[]>;
  shownDocument$: Observable<Document>;
  loading = true;

  @LocalStorage('own-submissions-year', '') year: number;
  yearInfo$: Observable<any[]>;

  yearInfoError: string;
  documentError: string;
  documentModalVisible = false;
  selectedFields = 'id,formID,gatherings[*].units[*],' +
    'gatherings[*].namedPlaceID,gatheringEvent.dateEnd,gatheringEvent.dateBegin,namedPlaceID,gatheringEvent.leg,dateEdited,' +
    'gatherings[*].id,gatherings[*].locality,publicityRestrictions,templateDescription,templateName,locked,creator,' +
    'gatherings[*].dateBegin,gatherings[*].dateEnd';

  constructor(
    private documentService: DocumentApi,
    private userService: UserService,
    private translate: TranslateService,
    private documentExportService: DocumentExportService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.modal.config = {animated: false};
    this.initDocuments(this.onlyTemplates);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initDocuments(this.onlyTemplates);
  }

  sliderRangeChange(newYear: number) {
    this.year = newYear;
    this.initDocuments(true);
  }

  onDocumentClick(docID: string) {
    this.shownDocument$ = this.documentService.findById(docID, this.userService.getToken());
    this.modal.show();
  }

  private initDocuments(onlyDocuments = false) {
    this.loading = true;

    if (this.namedPlace) {
      this.documents$ = this.getAllDocuments<SearchDocument>({
        year: this.year,
        namedPlace: this.namedPlace,
        collectionID: this.collectionID,
        formID: this.formID,
        selectedFields: this.selectedFields
      });
      return;
    }

    if (!onlyDocuments) {
      this.yearInfo$ = this.documentService.countByYear(this.userService.getToken(), {
        namedPlace: this.namedPlace,
        collectionID: this.collectionID,
        formID: this.formID
      }).pipe(
        map(results => results.map(res => ({...res, year: parseInt(res.year, 10)})).reverse()),
        tap((results: any[]) => {
          if (this.year && results.findIndex(item => item.year === this.year) > -1) {
            return;
          }
          this.year = results.length > 0 ? results[0].year : new Date().getFullYear();
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
      switchMap(() => this.getAllDocuments<SearchDocument>({
        year: this.onlyTemplates ? undefined : this.year,
        onlyTemplates: this.onlyTemplates,
        namedPlace: this.namedPlace,
        collectionID: this.collectionID,
        formID: this.formID,
        selectedFields: this.selectedFields
      }))
    );
  }

  private getAllDocuments<T>(
    query: DocumentQuery = {},
    page = 1,
    documents = []
  ): Observable<T[]> {
    return this.documentService.findAll(
      this.userService.getToken(),
      String(page),
      String(10000),
      query.year ? String(query.year) : undefined,
      {
        templates: query.onlyTemplates ? 'true' : undefined,
        namedPlace: query.namedPlace,
        collectionID: query.collectionID,
        formID: query.formID,
        selectedFields: query.selectedFields
      }
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

  documentsReady() {
    this.loading = false;
  }

  download(e: DownloadEvent) {
    if (e.documentId) {
      this.documentExportService.downloadDocument(
        this.documentService.findById(e.documentId, this.userService.getToken()), e.fileType
      );
    } else {
      this.documentExportService.downloadDocuments(
        this.getAllDocuments<Document>({year: this.year}), this.year, e.fileType
      );
    }
  }
}
