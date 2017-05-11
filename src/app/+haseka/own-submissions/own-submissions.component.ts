import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { DocumentInfoService } from '../document-info.service';
import { TranslateService } from '@ngx-translate/core';
import { DataTableBodyRowComponent } from '@swimlane/ngx-datatable';
import { UserService } from '../../shared/service/user.service';
import { Observable } from 'rxjs/Observable';
import { Person } from '../../shared/model/Person';


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

  @ViewChild(DataTableBodyRowComponent) child: DataTableBodyRowComponent;

  constructor(
    private documentService: DocumentApi,
    private translate: TranslateService,
    private userService: UserService
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

    /*Observable.of(this.activeDocuments)
     .mergeMap((document) => {
     return this.setRowData(document) })
     .subscribe((value) => {console.log(value); });*/

    Observable.from(this.activeDocuments.map((doc) => {
      return this.setRowData(doc);
    }))
      .mergeAll()
      .toArray()
      .subscribe((array) => {
        this.rows = array;
      });

    /*this.list = this.af.database.list("API_URL")
     .mergeMap((ItemKeys) => {
     return Observable.from(ItemKeys.map((ItemKey) => {
     return this.af.database.object(API_URL + "/" + ItemKey);
     })).mergeAll().toArray();
     })
     .subscribe((items) => {
     this.lineData = items;
     });*/
  }

  showViewer(event, docId: string) {
    event.stopPropagation();
    this.onShowViewer.emit(docId);
  }

  updateFilter(event) {
    const val = event.target.value;
    console.log(this.child);
    /*this.rows = this.rows.filter(function (row) {

     });*/
  }

  private setRowData(document: Document): Observable<any> {
    const gatheringInfo = DocumentInfoService.getGatheringInfo(document);
    const row = {};

    return this.getLocality(gatheringInfo).switchMap((locality) => {
        return this.getObservers(document['gatheringEvent'].leg).switchMap((observers) => {
            row['publicity'] = document.publicityRestrictions;
            row['dateEdited'] = moment(document.dateEdited).format('DD.MM.YYYY HH:mm');
            row['dateStart'] = gatheringInfo.dateBegin ? moment(gatheringInfo.dateBegin).format('DD.MM.YYYY') : '' ;
            row['dateEnd'] = gatheringInfo.dateEnd ? moment(gatheringInfo.dateEnd).format('DD.MM.YYYY') : '';
            row['locality'] = locality;
            row['unitCount'] = gatheringInfo.unitCount;
            row['observer'] = observers;
            row['collection'] = document.collectionID;
            row['keywords'] = '';
            row['id'] = document.id;
            return Observable.of(row);
          });
    });
  }

  private getLocality(gatheringInfo: any): Observable<string> {
    let locality = gatheringInfo.locality;

    return this.translate.get('haseka.users.latest.localityMissing').switchMap((localityMissing) => {
      if (!locality) {
        locality = localityMissing;
      }

      return this.translate.get('haseka.users.latest.other').switchMap((other) => {
        if (gatheringInfo.localityCount > 0) {
          locality += ' (' + gatheringInfo.localityCount + ' ' + other + ')';
        }
        return Observable.of(locality);
      });
    });
  }

  private getObservers(userArray: string[]): Observable<string> {
    return Observable.from(userArray.map((userId) => {
      return this.userService.getUser(userId)
        .switchMap((user: Person) => {
          return Observable.of(user.fullName);
        });
    }))
      .mergeAll()
      .toArray()
      .switchMap((array) => {
        return Observable.of(array.join(', '));
      });
  }
}
