import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges,
  Output
} from '@angular/core';
import { Logger } from '../../shared/logger/logger.service';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import { Observable } from 'rxjs/Observable';
import { Util } from '../../shared/service/util.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-haseka-latest',
  templateUrl: './haseka-users-latest.component.html',
  styleUrls: ['./haseka-users-latest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersLatestComponent implements OnChanges {
  @Input() userToken: string;
  @Output() onShowViewer = new EventEmitter<string>();

  public unpublishedDocuments: Document[] = [];
  public documents: Document[] = [];
  public formsById = {};
  public total = 0;
  public page = 1;
  public pageSize = 10;
  public loading = true;

  constructor(
    private documentService: DocumentApi,
    private formService: FormService,
    private translate: TranslateService,
    private logger: Logger,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnChanges() {
    this.updateDocumentList();
    this.updateTempDocumentList();
  }

  pageChanged(page) {
    this.page = page.page;
    this.loading = true;
    this.updateDocumentList();
  }
  updateTempDocumentList() {
    if (!this.userToken) {
      return;
    }
    this.formService.getAllTempDocuments()
      .switchMap(documents => this.processDocuments(documents))
      .subscribe((documents) => {
        this.unpublishedDocuments.push(...documents);
        this.cd.markForCheck();
      });
  }

  updateDocumentList() {
    if (!this.userToken) {
      return;
    }
    this.documentService.findAll(this.userToken, String(this.page), String(this.pageSize))
      .switchMap(response => Observable.of(response)
        .combineLatest(
          response.results ? this.processDocuments(response.results) : Observable.of([]),
          ((result, docs) => ({...result, docs: docs}))
        )
      )
      .subscribe(
        result => {
          this.documents = result.docs;
          this.total = result.total || 0;
          this.loading = false;
          this.cd.markForCheck();
        },
        err => {
          this.logger.warn('Unable to fetch users documents', err);
          this.loading = false;
          this.cd.markForCheck();
        }
      );
  }

  discardDocument(documents, i) {
    const id = documents[i].id;
    this.formService.discard(id);
    if (this.formService.isTmpId(id)) {
      documents.splice(i, 1);
    } else {
      this.documentService.findById(id, this.userToken)
        .subscribe(
          doc => {
            documents[i] = doc;
            documents.sort(this.compareEditDate);
            this.cd.markForCheck();
          }
        );
    }
  }

  showDocumentViewer(docId: string) {
    this.onShowViewer.emit(docId);
  }

  private processDocuments(docs: Document[]) {
    return Observable.from(docs.map((doc) => {
      return Observable.forkJoin(
        this.formService.hasUnsavedData(doc.id),
        this.getForm(doc.formID),
        (hasUnsavedData, form) => (hasUnsavedData)
      ).switchMap(
        (hasUnsavedData) => {
          if (hasUnsavedData) {
            return Observable.forkJoin(
              this.formService.getTmpDocumentIfNewerThanCurrent(doc),
              this.formService.getTmpDocumentStoreDate(doc.id),
              (document, storeDate) => {
                document = Util.clone(document);
                document._hasChanges = true;

                if (storeDate && (!document.dateEdited || new Date(storeDate) > new Date(document.dateEdited))) {
                  document.dateEdited = <any>storeDate;
                }
                return document;
              }
            );
          } else {
            return Observable.of(doc);
          }
        });
    }))
      .mergeAll()
      .toArray()
      .do((array) => {
        array.sort(this.compareEditDate);
      });
  }

  private getForm(formId: string): Observable<any> {
    if (this.formsById[formId]) { return Observable.of(this.formsById[formId]); }

    return this.formService
      .getForm(formId, this.translate.currentLang)
      .do((res: any) => {
        this.formsById[formId] = res;
      });
  }

  private compareEditDate(a: Document, b: Document) {
    if (new Date(a.dateEdited) < new Date(b.dateEdited)) {
      return 1;
    }
    if (new Date(a.dateEdited) > new Date(b.dateEdited)) {
      return -1;
    }
    return 0;
  }
}
