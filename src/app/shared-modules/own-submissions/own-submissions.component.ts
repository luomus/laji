import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges,
  ViewChild
} from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription ,  Observable, of as ObservableOf } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnSubmissionsComponent implements OnInit, OnChanges {

  @Input() formID;
  @Input() showDownloadAll = true;
  @Input() useInternalDocumentViewer = false;
  @Input() actions: string[]|false = ['edit', 'view', 'template', 'download', 'stats', 'delete'];
  @Input() columns = ['dateEdited', 'dateObserved', 'locality', 'unitCount', 'observer', 'form', 'id'];
  @Input() templateColumns = ['templateName', 'templateDescription', 'dateEdited', 'form', 'id'];
  @Input() onlyTemplates = false;
  @Input() namedPlace: string;
  @ViewChild('documentModal') public modal: ModalDirective;

  publicity = Document.PublicityRestrictionsEnum;

  activeDocuments: Document[];
  documentCache = {};
  documents$: Subscription;
  templates$: Subscription;
  shownDocument: Document;
  loading: boolean;

  year: number;
  yearInfo: any[];

  yearInfoError: string;
  documentError: string;
  currentDataKey: string;
  documentModalVisible = false;

  constructor(
    private documentService: DocumentApi,
    private userService: UserService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.modal.config = {animated: false};
    if (this.onlyTemplates) {
      this.initTemplates();
    } else {
      this.initDocuments();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const cacheKey = [this.formID, this.namedPlace, this.onlyTemplates].join(':');
    if (this.currentDataKey === cacheKey || !this.formID || !this.namedPlace) {
      return;
    }
    this.currentDataKey = cacheKey;

    if (this.onlyTemplates) {
      this.initTemplates();
    } else {
      this.initDocuments();
    }
  }

  sliderRangeChange(newYear: number) {
    this.year = newYear;
    this.getDocumentsByYear(this.year);
  }

  onDocumentClick(doc: Document) {
    this.shownDocument = doc;
    this.modal.show();
  }

  private initDocuments() {
    if (this.namedPlace) {
      this.getDocumentsByQuery({
        year: this.year,
        namedPlace: this.namedPlace
      });
      return;
    }
    this.documentService.countByYear(this.userService.getToken())
      .subscribe(
        (results) => {
          results = results.map(res => ({...res, year: parseInt(res.year, 10)}));
          this.year = results.length > 0 ? results[results.length - 1].year : new Date().getFullYear();
          this.yearInfo = results.reverse();
          this.getDocumentsByYear(this.year);
          this.cd.markForCheck();
        },
        (err) => {
          this.translate.get('haseka.form.genericError')
            .subscribe(msg => {
              this.yearInfoError = msg;
              this.cd.markForCheck();
            });
        }
    );
  }

  private initTemplates() {
    if (this.templates$) {
      return;
    }
    const tmpCacheKey = '_templates';
    if (this.documentCache[tmpCacheKey]) {
      this.activeDocuments = this.documentCache[tmpCacheKey];
      return;
    }
    this.activeDocuments = null;
    this.documentError = '';
    this.loading = true;
    this.documents$ = this.getAllDocuments({onlyTemplates: true})
      .subscribe(
        result => {
          this.documentCache[tmpCacheKey] = result;
          this.activeDocuments = this.filterDocuments(result);
          this.loading = false;
          this.cd.markForCheck();
        },
        err => {
          this.loading = false;
          this.translate.get('haseka.template.loadError')
            .subscribe(msg => {
              this.activeDocuments = [];
              this.documentError = msg;
              this.cd.markForCheck();
            });
        }
      );
  }

  private getDocumentsByQuery(query?: {year?: number, namedPlace?: string}) {
    if (this.documents$) {
      this.documents$.unsubscribe();
    }

    this.activeDocuments = null;
    this.documentError = '';

    this.loading = true;
    this.documents$ = this.getAllDocuments(query)
      .subscribe(
        result => {
          this.activeDocuments = this.filterDocuments(result);
          this.loading = false;
          this.cd.markForCheck();
        },
        err => {
          this.loading = false;
          this.translate.get('np.loadError')
            .subscribe(msg => {
              this.activeDocuments = [];
              this.documentError = msg;
              this.cd.markForCheck();
            });
        }
      );
  }

  private getDocumentsByYear(year: number) {
    if (this.documents$) {
      this.documents$.unsubscribe();
    }

    if (this.documentCache[String(year)]) {
      this.activeDocuments = this.filterDocuments(this.documentCache[String(year)]);
      return;
    }

    this.activeDocuments = null;
    this.documentError = '';

    if (!year) { return; }
    this.loading = true;
    this.documents$ = this.getAllDocuments({year: year})
      .subscribe(
        result => {
          this.documentCache[String(year)] = result;
          this.activeDocuments = this.filterDocuments(result);
          this.loading = false;
          this.cd.markForCheck();
        },
        err => {
          this.loading = false;
          this.translate.get('haseka.submissions.loadError', {year: year})
            .subscribe(msg => {
              this.activeDocuments = [];
              this.documentError = msg;
              this.cd.markForCheck();
            });
        }
      );
  }

  private filterDocuments(documents: any[]) {
    if (!this.formID) {
      return documents;
    }
    const lineTransectFormIds = {
      [environment.lineTransectForm]: true,
      [environment.lineTransectEiVakioForm]: true,
      [environment.lineTransectKartoitusForm]: true
    };
    return documents.filter((document) => {
      if (lineTransectFormIds[this.formID]) {
        return lineTransectFormIds[document.formID]

      } else {
        return document.formID === this.formID;
      }
    });
  }

  private getAllDocuments(
    query: {year?: number, onlyTemplates?: boolean, namedPlace?: string} = {},
    page = 1,
    documents = []
  ): Observable<Document[]> {
    return this.documentService
      .findAll(
        this.userService.getToken(),
        String(page),
        String(1000),
        query.year ? String(query.year) : undefined,
        {
          templates: query.onlyTemplates ? 'true' : undefined,
          namedPlace: query.namedPlace
        }
      )
      .switchMap(
        result => {
          documents.push(...result.results);
          if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
            return this.getAllDocuments(query, result.currentPage + 1, documents);
          } else {
            return ObservableOf(documents);
          }
        }
      );
  }
}
