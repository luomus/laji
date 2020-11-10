import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Observable } from 'rxjs';
import { ILatestDocument, LatestDocumentsFacade } from '../latest-documents.facade';


@Component({
  selector: 'laji-haseka-latest',
  templateUrl: './haseka-users-latest.component.html',
  styleUrls: ['./haseka-users-latest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersLatestComponent implements OnInit, OnChanges {
  @Input() tmpOnly = false;
  @Input() forms: string[];
  @Input() showFormNames: boolean;
  @Input() complainLocality: boolean;
  @Input() staticWidth: number = undefined;

  @Output() showViewer = new EventEmitter<Document>();

  public loading$: Observable<boolean>;
  public tmpDocuments$: Observable<ILatestDocument[]>;
  public latest$: Observable<ILatestDocument[]>;
  public formsById = {};

  constructor(
    private latestFacade: LatestDocumentsFacade
  ) {
    this.loading$ = this.latestFacade.loading$;
  }

  ngOnInit(): void {
    this.latestFacade.update();
    this.updateDocumentList();
    this.updateTempDocumentList();
  }

  ngOnChanges() {
    this.updateDocumentList();
    this.updateTempDocumentList();
  }

  updateTempDocumentList() {
    this.tmpDocuments$ = this.latestFacade.tmpDocuments$.pipe(
      map(documents => this.forms ? documents.filter(res => this.forms.indexOf(res.document.formID) > -1) : documents)
    );
  }

  updateDocumentList() {
    this.latest$ = this.latestFacade.latest$.pipe(
      map(documents => this.forms ? documents.filter(res => this.forms.indexOf(res.document.formID) > -1) : documents)
    );
  }

  discardTempDocument(document) {
    this.latestFacade.discardTmpData(document.id);
  }

  showDocumentViewer(doc: Document) {
    this.showViewer.emit(doc);
  }
}
