import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { DocumentViewerFacade, IViewerState } from '../document-viewer.facade';
import { Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Document } from '../../../shared/model/Document';
import {ModalComponent} from 'projects/laji-ui/src/lib/modal/modal/modal.component';

@Component({
  selector: 'laji-viewer-modal',
  templateUrl: './viewer-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewerModalComponent implements OnDestroy {

  publicityRestrictionsPublic = Document.PublicityRestrictionsEnum.publicityRestrictionsPublic;
  publicityRestrictionsPrivate = Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate;

  readonly vm$: Observable<IViewerState>;

  @ViewChild('documentModal', { static: false }) private modal: ModalComponent;

  private subHidden: Subscription;
  private open: boolean;
  private annotationOpen: boolean;

  constructor(
    private viewerFacade: DocumentViewerFacade
  ) {
    this.vm$ = this.viewerFacade.vm$.pipe(
      tap(vm => {

        if (vm.showModal === this.open && vm.openAnnotation === this.annotationOpen) {
          return;
        }

        if (vm.showModal && !this.open) {
          this.modal.show();
          this.subHidden = this.modal.onShownChange.pipe(filter(v => v === false)).subscribe(() => this.onModalHide());
        } else if (!vm.showModal) {
          this.modal?.hide();
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
