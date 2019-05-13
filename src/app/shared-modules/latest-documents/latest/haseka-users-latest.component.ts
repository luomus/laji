
import {toArray, mergeAll, tap, combineLatest, switchMap,  map } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Logger } from '../../../shared/logger/logger.service';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { FormService } from '../../../shared/service/form.service';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin as ObservableForkJoin, from as ObservableFrom, Observable, of as ObservableOf, Subscription } from 'rxjs';




@Component({
  selector: 'laji-haseka-latest',
  templateUrl: './haseka-users-latest.component.html',
  styleUrls: ['./haseka-users-latest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersLatestComponent implements OnChanges {
  @Input() userToken: string;
  @Input() tmpOnly = false;
  @Input() forms: string[];
  @Input() showFormNames: boolean;
  @Output() showViewer = new EventEmitter<Document>();

  public unpublishedDocuments: Document[] = [];
  public documents: Document[] = [];
  public formsById = {};
  public total = 0;
  public page = 1;
  public pageSize = 10;
  public loading = true;

  private docUpdateSub: Subscription;

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

  updateTempDocumentList() {
    if (!this.userToken) {
      return;
    }
    this.formService.getAllTempDocuments().pipe(
      switchMap(documents => this.processDocuments(documents)))
      .subscribe((documents) => {
        this.unpublishedDocuments = this.forms ? documents.filter(doc => this.forms.indexOf(doc.formID) > -1) : [...documents];
        this.cd.markForCheck();
      });
  }

  updateDocumentList() {
    if (!this.userToken) {
      return;
    }
    if (this.docUpdateSub) {
      this.docUpdateSub.unsubscribe();
    }
    this.docUpdateSub = ObservableOf(null).pipe(
      switchMap(() => this.documentService.findAll(this.userToken, String(this.page), String(this.pageSize))),
      switchMap(response => ObservableOf(response).pipe(
        combineLatest(
          response.results ? this.processDocuments(response.results) : ObservableOf([]),
          ((result, docs) => ({...result, docs: docs}))
        ))
      ), )
      .subscribe(
        result => {
          this.documents = this.forms ? result.docs.filter(doc => this.forms.indexOf(doc.formID) > -1) : [...result.docs];
          this.total = this.documents.length || 0;
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

  showDocumentViewer(doc: Document) {
    this.showViewer.emit(doc);
  }

  private processDocuments(docs: Document[]) {
    return ObservableFrom(docs.map((doc) => {
      return ObservableForkJoin(
        this.formService.hasUnsavedData(doc.id),
        this.getForm(doc.formID),
        (hasUnsavedData, form) => (hasUnsavedData)
      ).pipe(switchMap(
        (hasUnsavedData) => {
          if (hasUnsavedData) {
            return ObservableForkJoin(
              this.formService.getTmpDocumentIfNewerThanCurrent(doc),
              this.formService.getTmpDocumentStoreDate(doc.id)
            ).pipe(
              map(data => {
                const storeDate = data[1];
                const document = Util.clone(data[0]);
                document._hasChanges = true;

                if (storeDate && (!document.dateEdited || new Date(storeDate) > new Date(document.dateEdited))) {
                  document.dateEdited = <any>storeDate;
                }
                return document;
              })
            );
          } else {
            return ObservableOf(doc);
          }
        }));
    })).pipe(
      mergeAll(),
      toArray(),
      tap((array) => {
        array.sort(this.compareEditDate);
      }), );
  }

  private getForm(formId: string): Observable<any> {
    if (this.formsById[formId]) { return ObservableOf(this.formsById[formId]); }

    return this.formService
      .getForm(formId, this.translate.currentLang).pipe(
      tap((res: any) => {
        this.formsById[formId] = res;
      }));
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
