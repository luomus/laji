import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
  styleUrls: ['./own-submissions.component.css']
})
export class OwnSubmissionsComponent implements OnInit {

  @Input() formID;
  @Input() showDownloadAll = true;
  @Input() useInternalDocumentViewer = false;
  @ViewChild('documentModal') public modal: ModalDirective;

  activeDocuments: Document[];
  documentCache = {};
  documents$: Subscription;
  shownDocument: string;

  year: number;
  yearInfo: any[];

  yearInfoError: string;
  documentError: string;

  constructor(
    private documentService: DocumentApi,
    private userService: UserService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.documentService.countByYear(this.userService.getToken()).subscribe(
      (results) => {
        this.yearInfo = results;
        this.year = results.length > 0 ? results[results.length - 1].year : null;
        this.getDocumentsByYear(this.year);
      },
      (err) => {
        this.translate.get('haseka.form.genericError')
          .subscribe(msg => (this.yearInfoError = msg));
      }
    );
  }

  sliderRangeChange(newYear: number) {
    this.year = newYear;
    this.getDocumentsByYear(this.year);
  }

  onDocumentClick(docId) {
    this.shownDocument = docId;
    this.modal.show();
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

    this.documents$ = this.getAllDocumentsByYear(year)
      .subscribe(
        result => {
          this.documentCache[String(year)] = result;
          this.activeDocuments = this.filterDocuments(result);
        },
        err => {
          this.translate.get('haseka.submissions.loadError', {year: year})
            .subscribe(msg => {
              this.activeDocuments = [];
              this.documentError = msg;
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

  private getAllDocumentsByYear(year: number, page = 1, documents = []): Observable<Document[]> {
    return this.documentService
      .findAll(
        this.userService.getToken(),
        String(page),
        String(1000),
        String(year)
      )
      .switchMap(
        result => {
          documents.push(...result.results);
          if ('currentPage' in result && 'lastPage' in result && result.currentPage !== result.lastPage) {
            return this.getAllDocumentsByYear(year, result.currentPage + 1, documents);
          } else {
            return Observable.of(documents);
          }
        }
      );
  }
}
