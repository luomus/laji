import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css']
})
export class OwnSubmissionsComponent implements OnInit {
  @Input() userToken: string;
  @Output() onShowViewer = new EventEmitter<string>();
  activeDocuments: Document[];
  emptyMessage: '';
  totalMessage: '';
  publicity = Document.PublicityRestrictionsEnum;
  rows = [];
  defaultWidth = 120;

  constructor(
    private documentService: DocumentApi,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.documentService.findAll(this.userToken, String(1), String(10))
      .subscribe(
        result => {
          if (result.results) {
            this.activeDocuments = result.results;
            this.updateRows();
          }
        },
        err => {}
      );

    this.translate.get('haseka.submissions.noSubmissions').subscribe((value) => this.emptyMessage = value);
    this.translate.get('haseka.submissions.total').subscribe((value) => this.totalMessage = value);
  }

  updateRows() {
    this.rows = [];

    this.rows = this.activeDocuments.map((document => {
      const row = {};
      const gatheringDates = {start: undefined, end: undefined};
      let unitCount = 0;
      const locality = {firstLocality: null, otherLocalities: 0};

      for (let i = 0; i < document.gatherings.length; i++) {
        const gathering = document.gatherings[i];
        if (i === 0) {
          locality.firstLocality = gathering.locality;
          locality.otherLocalities = document.gatherings.length - 1;
        }
        if (gathering.dateBegin && (!gatheringDates.start || new Date(gathering.dateBegin) < new Date(gatheringDates.start))) {
          gatheringDates.start = gathering.dateBegin;
        }

        if (gathering.dateEnd && (!gatheringDates.end || new Date(gathering.dateEnd) > new Date(gatheringDates.end))) {
          gatheringDates.end = gathering.dateEnd;
        }

        if (gathering.units) {
          unitCount += gathering.units.length;
        }
      }

      if (document['gatheringEvent']) {
        const event = document['gatheringEvent'];
        if (event.dateBegin && (!gatheringDates.start || new Date(event.dateBegin) < new Date(gatheringDates.start))) {
          gatheringDates.start = event.dateBegin;
        }
        if (event.dateEnd && (!gatheringDates.end || new Date(event.dateEnd) > new Date(gatheringDates.end))) {
          gatheringDates.end = event.dateEnd;
        }
      }

      row['publicity'] = document.publicityRestrictions;
      row['dateEdited'] = document.dateEdited;
      row['dateStart'] = gatheringDates.start;
      row['dateEnd'] =  gatheringDates.end;
      row['locality'] = locality;
      row['unitCount'] = unitCount;
      row['observer'] = document['gatheringEvent'].leg;
      row['collection'] = document.collectionID;
      row['keywords'] = '';
      row['id'] = document.id;

      return row;
    }));
  }

  showViewer(event, docId: string) {
    event.stopPropagation();
    this.onShowViewer.emit(docId);
  }
}
