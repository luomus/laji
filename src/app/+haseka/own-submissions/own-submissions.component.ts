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


  sliderRange = new Date().getFullYear();

  sliderConfig = {
    connect: true,
    margin: 0,
    step: 1,
    range: {
      min: this.sliderRange - 10,
      max: this.sliderRange
    },
    pips: {
      mode: 'count',
      values: 11,
      density: 11,
      stepped: true,
      format: {to: (value, type) => {
        return '<div style="margin: 2px 5px; min-width: 90px">' + value +  '<br>100 kpl</div>';
      }}
    }
  };

  constructor(
    private documentService: DocumentApi,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.getDocumentsByYear(this.sliderRange);
  }

  sliderRangeChange(newRange) {
    if (this.sliderRange === newRange) { return; }

    this.sliderRange = newRange;
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
