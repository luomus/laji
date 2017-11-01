import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { ModalDirective } from 'ngx-bootstrap';

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnSubmissionsComponent implements OnInit {

  @Input() formID;
  @Input() showDownloadAll = true;
  @Input() useInternalDocumentViewer = false;
  @Input() columns = ['dateEdited', 'dateObserved', 'locality', 'unitCount', 'observer', 'form', 'id'];
  @Input() templateColumns = ['templateName', 'templateDescription', 'dateEdited', 'form', 'id'];
  @Input() onlyTemplates = false;
  @ViewChild('documentModal') public modal: ModalDirective;

  activeDocuments: Document[];
  documentCache = {};
  documents$: Subscription;
  templates$: Subscription;
  shownDocument: string;
  loading: boolean;

  year: number;
  yearInfo: any[];

  yearInfoError: string;
  documentError: string;

  constructor(
    private documentService: DocumentApi,
    private userService: UserService,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.modal.isAnimated = false;
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

  onDocumentClick(docId) {
    this.shownDocument = docId;
    this.modal.show();
  }

  private initDocuments() {
    this.documentService.countByYear(this.userService.getToken()).subscribe(
      (results) => {
        const now = new Date();
        this.yearInfo = results;
        this.year = results.length > 0 ? results[results.length - 1].year : now.getFullYear();
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
    return documents.filter((document) => {
      return document.formID === this.formID;
    });
  }

  private getAllDocuments(query: {year?: number, onlyTemplates?: boolean} = {}, page = 1, documents = []): Observable<Document[]> {
    return this.documentService
      .findAll(
        this.userService.getToken(),
        String(page),
        String(1000),
        query.year ? String(query.year) : undefined,
        query.onlyTemplates ? {templates: 'true'} : undefined
      )
      .switchMap(
        result => {
          documents.push(...result.results);
          if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
            return this.getAllDocuments(query, result.currentPage + 1, documents);
          } else {
            return Observable.of(documents);
          }
        }
      );
  }
}
