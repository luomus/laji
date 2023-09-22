import { ChangeDetectionStrategy, Component, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { DocumentViewerFacade, IViewerState } from '../document-viewer.facade';
import { Observable, Subscription } from 'rxjs';
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

  private subHidden: Subscription;
  private open: boolean;
  private annotationOpen: boolean;

  constructor(
    private viewerFacade: DocumentViewerFacade,
  ) {
    this.vm$ = this.viewerFacade.vm$.pipe(
      tap(vm => {
        if (vm.showModal === this.open && vm.openAnnotation === this.annotationOpen) {
          return;
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
