import { Component, OnInit } from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css']
})
export class OwnSubmissionsComponent implements OnInit {
  activeDocuments: Document[];
  documentCache = {};
  documents$: Subscription;

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
         const lastYear = results.length > 0 ? results[results.length - 1].year : null;
         this.getDocumentsByYear(lastYear);
      },
      (err) => {
        this.translate.get('haseka.form.genericError')
        .subscribe(msg => (this.yearInfoError = msg));
      }
    );
  }

  sliderRangeChange(newRange: number) {
    this.getDocumentsByYear(newRange);
  }

  private getDocumentsByYear(year: number) {
    if (this.documents$) {
      this.documents$.unsubscribe();
    }

    if (this.documentCache[String(year)]) {
      this.activeDocuments = this.documentCache[String(year)];
      return;
    }

    this.activeDocuments = null;
    this.documentError = '';

    if (!year) { return; }

    this.documents$ = this.documentService.findAll(this.userService.getToken(), String(1), String(1000), String(year))
      .subscribe(
        result => {
          if (result.results) {
            this.documentCache[String(year)] = result.results;
            this.activeDocuments = result.results;
          }
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
}
