import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Observable } from 'rxjs';
import { LatestDocumentsFacade } from '../latest-documents.facade';


@Component({
  selector: 'laji-haseka-latest',
  templateUrl: './haseka-users-latest.component.html',
  styleUrls: ['./haseka-users-latest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersLatestComponent implements OnInit {
  @Input() tmpOnly = false;
  @Input() formID: string;
  @Input() showFormNames = true;
  @Input() complainLocality: boolean;
  @Input() staticWidth: number = undefined;

  @Output() showViewer = new EventEmitter<Document>();

  public loading$: Observable<boolean>;
  public tmpDocuments$ = this.latestFacade.tmpDocuments$;
  public latest$ = this.latestFacade.latest$;
  public formsById = {};

  constructor(
    private latestFacade: LatestDocumentsFacade
  ) {
    this.loading$ = this.latestFacade.loading$;
  }

  ngOnInit(): void {
    this.latestFacade.update(this.formID);
  }

  discardTempDocument(document) {
    this.latestFacade.discardTmpData(document.id);
  }

  showDocumentViewer(doc: Document) {
    this.showViewer.emit(doc);
  }
}
