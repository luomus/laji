import { Component, OnInit } from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { UserService } from '../../shared/service/user.service';
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

  constructor(
    private documentService: DocumentApi,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.documentService.countByYear(this.userService.getToken()).subscribe(
      (results) => {
        this.yearInfo = results;
        const lastYear = results.length > 0 ? results[results.length - 1].year : null;
        this.getDocumentsByYear(lastYear);
      },
      (err) => { }
    );
  }

  sliderRangeChange(newRange: Number) {
    this.getDocumentsByYear(newRange);
  }

  private getDocumentsByYear(year: Number) {
    if (this.documents$) {
      this.documents$.unsubscribe();
    }

    if (this.documentCache[String(year)]) {
      this.activeDocuments = this.documentCache[String(year)];
      return;
    }

    this.activeDocuments = null;

    if (!year) { return; }

    this.documents$ = this.documentService.findAll(this.userService.getToken(), String(1), String(1000), String(year))
      .subscribe(
        result => {
          if (result.results) {
            this.documentCache[String(year)] = result.results;
            this.activeDocuments = result.results;
          }
        },
        err => { }
      );
  }
}
