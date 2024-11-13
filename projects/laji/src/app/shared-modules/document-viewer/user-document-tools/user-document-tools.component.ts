import { ChangeDetectionStrategy, Component, Input, Output, ViewChild, HostListener, EventEmitter, ChangeDetectorRef, OnInit, TemplateRef } from '@angular/core';
import { IdService } from '../../../shared/service/id.service';
import { FormService } from '../../../shared/service/form.service';
import { TemplateForm } from '../../own-submissions/models/template-form';
import { DocumentToolsService } from '../document-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/service/user.service';
import { DocumentService } from '../../own-submissions/service/document.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { Logger } from '../../../shared/logger';
import { ReloadObservationViewService } from '../../../shared/service/reload-observation-view.service';
import { filter, switchMap } from 'rxjs/operators';
import { Global } from '../../../../environments/global';
import { DocumentViewerFacade } from '../document-viewer.facade';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';
import {Subject, Subscription} from 'rxjs';

@Component({
  selector: 'laji-user-document-tools',
  templateUrl: './user-document-tools.component.html',
  styleUrls: ['./user-document-tools.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDocumentToolsComponent implements OnInit {

  @Input() actions: string[]|false = ['edit', 'template', 'delete'];
  @Input() templateForm: TemplateForm = {
    name: '',
    description: ''
  };
  @Input() onlyTemplates = false;
  @Input() hasEditRights? = false;
  @Input() hasDeleteRights? = false;

  @Output() documentDeleted = new EventEmitter<string>();

  linkLocation = '';
  _formID: string;
  _documentID: string;

  loading = false;

  modalRef: ModalRef;
  modalIsOpen = false;

  @ViewChild('saveAsTemplate', { static: true }) public templateModal: TemplateRef<any>;
  @ViewChild('deleteModal', { static: true }) public deleteModal: TemplateRef<any>;

  constructor(
    private formService: FormService,
    private documentToolsService: DocumentToolsService,
    private translate: TranslateService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private documentApi: DocumentApi,
    private userService: UserService,
    private documentService: DocumentService,
    private toastService: ToastsService,
    private logger: Logger,
    private reloadObservationView: ReloadObservationViewService,
    private documentViewerFacade: DocumentViewerFacade
  ) { }

  @Input()
  set documentID(documentID: string|undefined) {
    this._documentID = IdService.getId(documentID);
    this.updateLink();
  }

  @Input()
  set formID(formID: string|undefined) {
    this._formID = IdService.getId(formID);
    this.updateLink();
  }

  ngOnInit() {
    this.onModalHide.subscribe(() => {
      if (!this.router.url.includes('view')) {
        this.modalIsOpen = false;
        this.documentToolsService.emitChildEvent(false);
        this.cd.detectChanges();
      }
    });
  }

  modalHideSub: Subscription;
  onModalHide = new Subject<void>();

  makeTemplate() {
    this.modalRef = this.modalService.show(this.templateModal, {size: 'sm'});
    this.modalHideSub?.unsubscribe();
    this.modalHideSub = this.modalRef.onShownChange.pipe(filter(v => v === false)).subscribe(() => this.onModalHide.next());
    this.documentToolsService.emitChildEvent(true);
    this.modalIsOpen = true;
  }

  makeDelete() {
    this.modalRef = this.modalService.show(this.deleteModal, {size: 'sm'});
    this.modalHideSub?.unsubscribe();
    this.modalHideSub = this.modalRef.onShownChange.pipe(filter(v => v === false)).subscribe(() => this.onModalHide.next());
    this.documentToolsService.emitChildEvent(true);
    this.modalIsOpen = true;
  }

  onLinkNp() {
    this.documentViewerFacade.close();
  }

  closeModal() {
    this.modalRef?.hide();
  }

  saveTemplate() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.documentApi.findById(this._documentID, this.userService.getToken()).pipe(
      switchMap(document => this.documentService.saveTemplate({...this.templateForm, document}))
    ).subscribe(
      () => {
        this.translate.get('template.success')
          .subscribe((value) => this.toastService.showSuccess(value));
        this.templateForm = {
          name: '',
          description: ''
        };
        this.loading = false;
        this.closeModal();
        this.cd.markForCheck();
      },
      (err) => {
        this.translate.get('template.error')
          .subscribe((value) => this.toastService.showError(value));
        this.logger.error('Template saving failed', err);
        this.loading = false;
        this.cd.markForCheck();
      });
  }

  deleteDocument() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.documentService.deleteDocument(this._documentID)
      .subscribe(
        () => {
          this.translate.get('delete.success')
            .subscribe((value) => this.toastService.showSuccess(value));
          this.loading = false;
          // this.documents = this.documents.filter(doc => doc.id !== docId);
          // this.documentsLoaded.emit(this.documents);
          this.closeModal();
          this.documentDeleted.emit(this._documentID);
          this.reloadObservationView.emitChildEvent(false);
          this.cd.markForCheck();
          this.reloadObservationView.emitChildEvent(false);
        },
        (err) => {
          this.translate.get('delete.error')
            .subscribe((value) => this.toastService.showError(value));
          // this.initDocuments(this.onlyTemplates);
          this.logger.error('Deleting failed', err);
          this.loading = false;
          this.cd.markForCheck();
        }
      );
  }

  onClickOutside() {
    this.closeModal();
  }

  showMakeTemplate(formID: string): boolean {
    return formID && Global.canHaveTemplate.indexOf(formID) > -1;
  }

  private updateLink() {
    if (!this._documentID || !this._formID) {
      return;
    }
    this.linkLocation = this.formService.getEditUrlPath(this._formID, this._documentID);
  }

  @HostListener('document:keydown', ['$event'])
  documentToolsKeyDown(e: KeyboardEvent) {
    if (e.keyCode === 27 && this.modalIsOpen) {
       e.preventDefault();
       this.closeModal();
      }
  }
}
