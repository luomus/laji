import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { Logger } from '../../shared/logger/logger.service';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import { Observable } from 'rxjs/Observable';
import { Util } from '../../shared/service/util.service';
import has = Reflect.has;

@Component({
  selector: 'laji-haseka-latest',
  templateUrl: './haseka-users-latest.component.html',
  styleUrls: ['./haseka-users-latest.component.css']
})
export class UsersLatestComponent implements OnChanges {
  @Input() userToken: string;
  @Output() onShowViewer = new EventEmitter<string>();

  public unpublishedDocuments: Document[] = [];
  public documents: Document[] = [];
  public total = 0;
  public page = 1;
  public pageSize = 10;
  public loading = true;

  constructor(
    private documentService: DocumentApi,
    private formService: FormService,
    private logger: Logger
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
      .subscribe(documents => {
        this.addDocuments(documents, this.unpublishedDocuments);
      });
  }

  updateDocumentList() {
    if (!this.userToken) {
      return;
    }
    this.documentService.findAll(this.userToken, String(this.page), String(this.pageSize))
      .subscribe(
        result => {
          this.loading = false;
          if (result.results) {
            this.addDocuments(result.results, this.documents);
          }
          this.total = result.total || 0;
        },
        err => this.logger.warn('Unable to fetch users documents', err)
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
          }
        );
    }
  }

  showDocumentViewer(docId: string) {
    this.onShowViewer.emit(docId);
  }

  private addDocuments(docs: Document[], targetArray: Document[]) {
    Observable.from(docs.map((doc) => {
      return this.formService.hasUnsavedData(doc.id).switchMap(
        (hasUnsavedData) => {
          if (hasUnsavedData) {
            return Observable.forkJoin(
              this.formService.getTmpDocumentIfNewerThanCurrent(doc),
              this.formService.getTmpDocumentStoreDate(doc.id),
              (document, storeDate) => {
                document = Util.clone(document);
                document._hasChanges = true;

                if (storeDate && (!document.dateEdited || new Date(storeDate) > new Date(document.dateEdited))) {
                  document.dateEdited = storeDate;
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
      .subscribe((array) => {
        array.sort(this.compareEditDate);
        targetArray.push(...array);
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
