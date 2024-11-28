import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Observable, Subscription } from 'rxjs';
import { LatestDocumentsFacade } from '../latest-documents.facade';
import { DeleteOwnDocumentService } from '../../../shared/service/delete-own-document.service';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'laji-haseka-latest',
  templateUrl: './haseka-users-latest.component.html',
  styleUrls: ['./haseka-users-latest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersLatestComponent implements OnInit, OnDestroy {
  @Input() tmpOnly = false;
  @Input() collectionID!: string;
  @Input() showFormNames = true;
  @Input() complainLocality?: boolean;
  @Input() staticWidth?: number = undefined;

  @Output() showViewer = new EventEmitter<Document>();

  public firstLoad = true;
  public loading$: Observable<boolean>;
  public tmpDocuments$ = this.latestFacade.tmpDocuments$;
  public latest$ = this.latestFacade.latest$;
  public formsById = {};
  public subscriptionDeleteOwnDocument?: Subscription;

  constructor(
    private latestFacade: LatestDocumentsFacade,
    private deleteOwnDocument: DeleteOwnDocumentService
  ) {
    this.loading$ = this.latestFacade.loading$.pipe(tap(loading => {
      if (this.firstLoad && !loading) {
        this.firstLoad = false;
      }
    }));
  }

  ngOnInit(): void {
    this.latestFacade.setCollectionID(this.collectionID);

    this.subscriptionDeleteOwnDocument = this.deleteOwnDocument.childEventListner().subscribe(id => {
      if (id !== null) {
        this.latestFacade.update();
      }
    });
  }

  ngOnDestroy(): void {
      this.subscriptionDeleteOwnDocument?.unsubscribe();
  }

  discardTempDocument(document: Document & { id: string }) {
    this.latestFacade.discardTmpData(document.id);
  }

  showDocumentViewer(doc: Document) {
    this.showViewer.emit(doc);
  }
}
