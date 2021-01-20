import { ChangeDetectionStrategy, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { DocumentViewerFacade, IViewerState } from '../document-viewer.facade';
import { Observable, Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { tap } from 'rxjs/operators';
import { Document } from '../../../shared/model/Document';

@Component({
  selector: 'laji-viewer-modal',
  templateUrl: './viewer-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerModalComponent implements OnDestroy {

  publicityRestrictionsPublic = Document.PublicityRestrictionsEnum.publicityRestrictionsPublic;
  publicityRestrictionsPrivate = Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate;

  @ViewChild('documentModal', { static: false }) public modal: TemplateRef<any>;
  readonly vm$: Observable<IViewerState>;

  private modalRef: BsModalRef;
  private subHidden: Subscription;
  private open: boolean;
  private annotationOpen: boolean;

  constructor(
    private viewerFacade: DocumentViewerFacade,
    private modalService: BsModalService
  ) {
    this.vm$ = this.viewerFacade.vm$.pipe(
      tap(vm => {
        if (vm.showModal === this.open && vm.openAnnotation === this.annotationOpen) {
          return;
        }
        if (vm.showModal && !this.open) {
          this.modalRef = this.modalService.show(this.modal, { keyboard: false });
          this.subHidden = this.modalRef.onHidden.subscribe(() => this.onModalHide());
        } else if (!vm.showModal && this.modalRef) {
          this.modalRef.hide();
        }
        if (this.modalRef) {
          this.modalRef.setClass(vm.openAnnotation ? 'modal-annotation' : 'modal-lg');
        }

        this.open = vm.showModal;
        this.annotationOpen = vm.openAnnotation;
      })
    );
  }

  ngOnDestroy(): void {
    if (this.subHidden) {
      this.subHidden.unsubscribe();
    }
  }

  onModalHide() {
    this.viewerFacade.close();
  }

  closeModal() {
    this.viewerFacade.close();
  }
}
