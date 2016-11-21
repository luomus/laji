import { Component, Input, OnChanges } from '@angular/core';
import { Document, DocumentApi } from '../../shared';
import { FormService } from '../form/form.service';
import { subscribeOn } from 'rxjs/operator/subscribeOn';
import { Logger } from '../../shared/logger/logger.service';

@Component({
  selector: 'laji-haseka-latest',
  templateUrl: 'haseka-users-latest.component.html'
})
export class UsersLatestComponent implements OnChanges {

  @Input() userToken: string;

  public unsavedDocuments: Document[];
  public documents: Document[];
  public total = 0;
  public page = 1;
  public pageSize = 10;
  public loading: boolean = true;

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
        this.unsavedDocuments = documents.map(document => {
          document.hasChanges = true;
          return document;
        });
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
          this.documents = (result.results || []);
          this.total = result.total || 0;
        },
        err => this.logger.warn('Unable to fetch users documents', err)
      );
  }
}
