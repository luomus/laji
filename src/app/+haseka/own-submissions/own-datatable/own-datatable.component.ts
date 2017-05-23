import { Component, OnInit, OnDestroy, OnChanges, ViewChild, Input } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { DocumentInfoService } from '../../document-info.service';
import { TranslateService } from '@ngx-translate/core';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { UserService } from '../../../shared/service/user.service';
import { Observable } from 'rxjs/Observable';
import { Person } from '../../../shared/model/Person';
import { FormService } from '../../../shared/service/form.service';
import { RouterChildrenEventService } from '../../router-children-event.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { queue } from 'rxjs/scheduler/queue';

@Component({
  selector: 'laji-own-datatable',
  templateUrl: './own-datatable.component.html',
  styleUrls: ['./own-datatable.component.css']
})
export class OwnDatatableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() documents: Document[];

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
    private translate: TranslateService,
    private router: Router,
    private userService: UserService,
    private formService: FormService,
    private eventService: RouterChildrenEventService
  ) {}

  ngOnInit() {
    this.updateTranslations();

    this.subTrans = this.translate.onLangChange.subscribe(() => {
      this.updateRows();
      this.updateTranslations();
    });
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  ngOnChanges() {
    this.updateRows();
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

  private updateRows() {
    if (!this.documents) {
      this.temp = [];
      this.rows = [];
      return;
    }

    this.rows = null;
    if (this.rowData$) {
      this.rowData$.unsubscribe();
    }

    this.rowData$ = Observable.from(this.documents.map((doc, i) => {
      return this.setRowData(doc, i);
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

  tableActivated(event) {
    if (event.type === 'click') {
      const formId = this.documents[event.row.index].formID;
      this.router.navigate([this.formService.getEditUrlPath(formId, event.row.id)]);
    }
  }

  downloadDocument(event, index) {
    event.stopPropagation();

    const uri = encodeURI(this.documentToCsv(this.documents[index]));
    const downloadLink = document.createElement('a');
    downloadLink.href = uri;
    downloadLink.download = 'data.csv';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  private documentToCsv(document: Document) {
    let csv = 'data:text/csv;charset=utf-8';

    const keys = this.getKeys(document);

    for (let i = 0; i < keys.length; i++) {
      for (let j = 0; j < keys[i].length; j++) {
        csv += keys[i][j];

        if (i !== keys.length - 1 || j !== keys[i].length - 1) {
          csv += '; ';
        } else {
          csv += '\n';
        }
      }
    }
    console.log(keys);
    console.log(csv);
    csv = this.addCsvRows(document, keys, csv, 0);
    console.log(csv);

    return csv;
  }


  private getKeys(document: Document) {
    const queue = [{obj: document, depth: 0}];
    let next, obj, depth;

    const keys = [];

    while (queue.length > 0) {
      next = queue.shift();
      obj = next.obj;
      depth = next.depth;

      for (const i in obj) {
        if (!obj.hasOwnProperty(i) || i.charAt(0) === '@') {
          continue;
        }

        if (!keys[depth]) { keys[depth] = []; }

        if (keys[depth].indexOf(i) === -1
          && isNaN(Number(i))
          && (obj[i] || obj[i] === 0)
          && (typeof obj[i] !== 'object' || Array.isArray(obj[i]))) {
          keys[depth].push(i);
        }

        if (typeof obj[i] === 'object') {
          queue.push({obj: obj[i], depth: next.depth + 1});
        }
      }
    }

    return keys;
  }

  private addCsvRows(obj, keys, csv, depth) {
    for (let i = 0; i < keys[depth].length; i++) {
      const key = keys[depth][i];
      if (obj[key] || obj[key] === 0) {
        csv += obj[key];
      }
      if (i !== keys[depth].length - 1) {
        csv += '; ';
      }

      /*if (typeof obj[i] === 'object') {
        this.addCsvRows(obj[i], keys, csv);
      }*/
    }
    return csv;
  }

  private setRowData(document: Document, idx: Number): Observable<any> {
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
        index: idx
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

  private getFormName(formId: string): Observable<string> {
    return this.formService
      .getForm(formId, this.translate.currentLang)
      .map((res: any) => res.title || formId);
  }
}
