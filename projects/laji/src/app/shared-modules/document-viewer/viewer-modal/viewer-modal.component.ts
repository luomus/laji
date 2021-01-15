import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DocumentViewerFacade, IViewerState } from '../document-viewer.facade';
import { Observable, Subscription } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { tap } from 'rxjs/operators';
import { Document } from '../../../shared/model/Document';

@Component({
  selector: 'laji-viewer-modal',
  templateUrl: './viewer-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerModalComponent implements OnInit, OnDestroy {

  publicityRestrictionsPublic = Document.PublicityRestrictionsEnum.publicityRestrictionsPublic;
  publicityRestrictionsPrivate = Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate;


  @ViewChild('documentModal', { static: true }) public modal: ModalDirective;
  vm$: Observable<IViewerState>;

  private subModal: Subscription;

  constructor(private viewerFacade: DocumentViewerFacade) { }

  ngOnInit() {
    this.vm$ = this.viewerFacade.vm$;
    this.subModal = this.viewerFacade.showModal$.pipe(
      tap((visible) => visible ? this.modal.show() : this.modal.hide())
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.subModal) {
      this.subModal.unsubscribe();
    }
    const body = document.body;
    if (body.classList.contains('modal-open-after')) {
      body.classList.remove('modal-open-after');
    }

  }

  onModalHide() {
    const body = document.body;
    if (body.classList.contains('modal-open-after')) {
      body.classList.remove('modal-open-after');
    }
    this.viewerFacade.close();
  }

  pnModalShow() {

  }

  closeModal() {
    this.viewerFacade.close();
  }
}
