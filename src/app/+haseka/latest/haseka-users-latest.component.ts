import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { Logger } from '../../shared/logger/logger.service';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { FormService } from '../../shared/service/form.service';

@Component({
  selector: 'laji-haseka-latest',
  templateUrl: './haseka-users-latest.component.html',
  styleUrls: ['./haseka-users-latest.component.css']
})
export class UsersLatestComponent implements OnChanges {

  @Input() userToken: string;
  @Output() tabChange = new EventEmitter<string>();

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

  changeTab(tab: string) {
    this.tabChange.emit(tab);
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
        this.unpublishedDocuments.push(...<Document[]>documents.map(document => {
          document.hasChanges = true;
          return document;
        }));
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
            this.addDocuments(result.results);
          }
          this.total = result.total || 0;
        },
        err => this.logger.warn('Unable to fetch users documents', err)
      );
  }

  private addDocuments(docs) {
    for (let i = 0; i < docs.length; i++) {
      if (docs[i].publicityRestrictions && docs[i].publicityRestrictions === 'MZ.publicityRestrictionsPrivate') {
        this.unpublishedDocuments.push(docs[i]);
      } else {
        if (this.documents.length < 10) {
          this.documents.push(docs[i]);
        }
      }
    }
  }
}
