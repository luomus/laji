import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Document } from '../../shared/model/Document';
import { DocumentInfoService } from '../document-info.service';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { UserService } from '../../shared/service/user.service';
import { Observable } from 'rxjs/Observable';
import { Person } from '../../shared/model/Person';
import { FormService } from '../../shared/service/form.service';
import { RouterChildrenEventService } from '../router-children-event.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-own-submissions',
  templateUrl: './own-submissions.component.html',
  styleUrls: ['./own-submissions.component.css']
})
export class OwnSubmissionsComponent implements OnInit, OnDestroy {
  activeDocuments: Document[];
  emptyMessage: '';
  totalMessage: '';
  publicity = Document.PublicityRestrictionsEnum;
  columns = ['dateEdited', 'dateStart', 'dateEnd', 'locality', 'unitCount', 'observer', 'form', 'id'];
  temp = [];
  rows: any[];
  defaultWidth = 120;

  subTrans: Subscription;
  rowData$: Subscription;

  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private documentService: DocumentApi,
    private translate: TranslateService,
    private userService: UserService,
    private formService: FormService,
    private eventService: RouterChildrenEventService,
    private router: Router
  ) { }

  ngOnInit() {
    this.documentService.findAll(this.userService.getToken(), String(1), String(1000))
      .subscribe(
        result => {
          if (result.results) {
            this.activeDocuments = result.results;
            this.updateRows();
          }
        },
        err => {}
      );

    this.updateTranslations();

    this.subTrans = this.translate.onLangChange.subscribe(() => {
      this.updateRows();
      this.updateTranslations();
    });
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  private updateRows() {
    this.rows = null;
    if (this.rowData$) {
      this.rowData$.unsubscribe();
    }

    this.rowData$ = Observable.from(this.activeDocuments.map((doc) => {
      return this.setRowData(doc);
    }))
      .mergeAll()
      .toArray()
      .subscribe((array) => {
        this.temp = array;
        this.rows = this.temp;
      });
  }

  private updateTranslations() {
    this.translate.get('haseka.submissions.noSubmissions').subscribe((value) => this.emptyMessage = value);
    this.translate.get('haseka.submissions.total').subscribe((value) => this.totalMessage = value);
  }

  showViewer(event, docId: string) {
    event.stopPropagation();
    this.eventService.showViewerClicked(docId);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const columns = this.columns;

    this.rows = this.temp.filter(function (row) {
      for (let i = 0; i < columns.length; i++) {
        const rowValue = String(row[columns[i]]);
        if (rowValue && (rowValue.toLowerCase().indexOf(val) !== -1 || !val)) {
          return true;
        }
      }
      return false;
    });

    this.table.offset = 0;
  }

  tableActivated(event) {
    if (event.type === 'click') {
      this.router.navigate([this.formService.getEditUrlPath(event.row.formId, event.row.id)]);
    }
  }

  private setRowData(document: Document): Observable<any> {
    const gatheringInfo = DocumentInfoService.getGatheringInfo(document);

    return Observable.forkJoin(
      this.getLocality(gatheringInfo),
      this.getObservers(document.gatheringEvent && document.gatheringEvent.leg),
      this.getFormName(document.formID),
      (locality, observers, formName) => ({
        publicity: document.publicityRestrictions,
        dateEdited: moment(document.dateEdited).format('DD.MM.YYYY HH:mm'),
        dateStart: gatheringInfo.dateBegin ? moment(gatheringInfo.dateBegin).format('DD.MM.YYYY') : '' ,
        dateEnd: gatheringInfo.dateEnd ? moment(gatheringInfo.dateEnd).format('DD.MM.YYYY') : '',
        locality: locality,
        unitCount: gatheringInfo.unitCount,
        observer: observers,
        form: formName,
        id: document.id,
        formId: document.formID
      })
    );
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

  private getObservers(userArray: string[] = []): Observable<string> {
    return Observable.from(userArray.map((userId) => {
      if (userId.indexOf('MA.') === 0) {
        return this.userService.getUser(userId)
          .switchMap((user: Person) => {
            return Observable.of(user.fullName);
          });
      }
      return Observable.of(userId);
    }))
      .mergeAll()
      .toArray()
      .switchMap((array) => {
        return Observable.of(array.join(', '));
      });
  }

  private getFormName(formId: string): Observable<string> {
    return this.formService
      .getForm(formId, this.translate.currentLang)
      .map((res: any) => res.title || formId);
  }
}
