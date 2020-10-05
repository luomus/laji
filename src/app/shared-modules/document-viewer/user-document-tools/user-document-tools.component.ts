import { ChangeDetectionStrategy, Component, Input, Output, ViewChild,
  HostListener, EventEmitter, ChangeDetectorRef, OnInit} from '@angular/core';
import { IdService } from '../../../shared/service/id.service';
import { FormService } from '../../../shared/service/form.service';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateForm } from '../../own-submissions/models/template-form';
import { DocumentToolsService } from '../../../shared-modules/document-viewer/document-tools.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/service/user.service';
import { DocumentService } from '../../own-submissions/service/document.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { Logger } from '../../../shared/logger';
import { ReloadObservationViewService } from '../../../shared/service/reload-observation-view.service'
import { catchError, map, switchMap, flatMap, mergeMap, take } from 'rxjs/operators';
import { Person } from '../../../shared/model/Person';
import { Global } from '../../../../environments/global';
import { of, forkJoin, Observable } from 'rxjs';
import { Form } from '../../../shared/model/Form';
// import { EventEmitter } from 'protractor';
// import { EventEmitter } from 'redlock';

@Component({
  selector: 'laji-user-document-tools',
  templateUrl: './user-document-tools.component.html',
  styleUrls: ['./user-document-tools.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDocumentToolsComponent implements OnInit {

  @Input() actions: string[]|false = ['edit','template','delete'];
  @Input() templateForm: TemplateForm = {
    name: '',
    description: '',
    type: 'gathering'
  };
  @Input() onlyTemplates = false;
  @Output() documentDeleted = new EventEmitter<string>();


  linkLocation = '';
  _editors: string[];
  _formID: string;
  _allowTemplate: boolean;
  _personID: string;
  _documentID: string;
  hasEditRights = false;
  loading = false;
  hasAdminRights = false;
  modalRef: any;
  modalIsOpen = false;


  @ViewChild('saveAsTemplate', { static: true }) public templateModal: ModalDirective;
  @ViewChild('deleteModal', { static: true }) public deleteModal: ModalDirective;

  constructor(
    private formService: FormService,
    private documentToolsService: DocumentToolsService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private documentApi: DocumentApi,
    private userService: UserService,
    private documentService: DocumentService,
    private toastService: ToastsService,
    private logger: Logger,
    private reloadObservationView: ReloadObservationViewService
  ) { }

  @Input()
  set editors(editors: string[]) {
    this._editors = editors;
    this.checkEditRight();
  }

  @Input()
  set personID(personID: string) {
    this._personID = personID;
    this.checkEditRight();
  }

  @Input()
  set documentID(documentID: string) {
    this._documentID = IdService.getId(documentID);
    this.updateLink();
  }

  @Input()
  set formID(formID: string) {
    this.formService.getAllForms(this.translate.currentLang).pipe(
      map(forms => forms.find(form => form.id === formID)),
      take(1)
    ).subscribe(form => {
      this._formID = form.id;
      this._allowTemplate = form.options?.allowTemplate;
      this.updateLink();
    });
  }

  ngOnInit() {
    this.modalService.onHide.subscribe((e) => {
      const body = document.body;
      console.log('hola')
      if (!this.router.url.includes('view')) {
        body.classList.add("modal-open-after");
        this.modalIsOpen = false;
        this.documentToolsService.emitChildEvent(false);
        this.cd.detectChanges();
      }
    });

    this.userService.isLoggedIn$.subscribe(login => {
      if ((this._editors.indexOf(this._personID) !== -1 || this._editors.length === 0) && login ){
        this.checkAdminRight();
      }
    })
  }

  makeTemplate() {
    this.modalRef = this.modalService.show(this.templateModal, {class: 'modal-sm tools', backdrop: true});
    this.documentToolsService.emitChildEvent(true);
    this.modalIsOpen = true;
  }

  makeDelete() {
    this.modalRef = this.modalService.show(this.deleteModal, {class: 'modal-sm tools', backdrop: true});
    this.documentToolsService.emitChildEvent(true);
    this.modalIsOpen = true;
  }

  closeModal(event){
    if (this.modalRef) {
      this.modalRef.hide();
      const body = document.body;
      body.classList.add("modal-open-after");
    }
  }

  saveTemplate() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.documentApi.findById(this._documentID, this.userService.getToken()).pipe(
      switchMap(document => this.documentService.saveTemplate({...this.templateForm, document: document}))
    ).subscribe(
      () => {
        this.translate.get('template.success')
          .subscribe((value) => this.toastService.showSuccess(value));
        this.templateForm = {
          name: '',
          description: '',
          type: 'gathering'
        };
        this.loading = false;
        this.closeModal(event);
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
          this.closeModal(event);
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
    this.closeModal(event);
  }

  private checkEditRight() {
    if (!this._personID || !this._editors) {
      this.hasEditRights = false;
      return;
    }
    this.hasEditRights = this._editors.indexOf(this._personID) !== -1;
    if (this.hasEditRights) {
      this.updateLink();
    }
  }

  private checkAdminRight() {
    /*this.documentApi.findById(this._documentID, this.userService.getToken()).pipe(
      map(document => document.creator),
      map(creator => this._personID === creator),
      catchError(() => of(false))
    ).subscribe(hasAdminRights => {
      this.hasAdminRights = hasAdminRights;
      this.cd.markForCheck();
    });*/

    const documentCreator$ = this.documentApi.findById(this._documentID, this.userService.getToken()).pipe(
      map(document => document.creator),
      map(creator => this._personID === creator),
      catchError(() => of(false))
    )

    const documentEditor$ = this.hasEditRights ? of(true) : this.documentApi.findById(this._documentID, this.userService.getToken()).pipe(
      map(document => document.editor),
      map(editors => editors.indexOf(this._personID) !== -1),
      catchError(() => of(false))
    )

    forkJoin(documentCreator$, documentEditor$).subscribe(([hasAdminRights, hasEditRights]) => {
      this.hasAdminRights = hasAdminRights;
      this.hasEditRights = hasEditRights;
      if(this.hasEditRights) {
        this.updateLink();
      }
      this.cd.markForCheck();
    })
  }


  private updateLink() {
    if (!this.hasEditRights || !this._documentID || !this._formID) {
      return;
    }
    this.linkLocation = this.formService.getEditUrlPath(this._formID, this._documentID);
  }

  @HostListener('document:keydown', ['$event'])
  documentToolsKeyDown(e: KeyboardEvent) {
    if (e.keyCode === 27 && this.modalIsOpen) {
      e.stopImmediatePropagation();
       this.closeModal(event);
      }

  }

}
