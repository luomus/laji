import { ChangeDetectionStrategy, Component, Input, ViewChild, Output,
EventEmitter, HostListener, ChangeDetectorRef, OnInit} from '@angular/core';
import { IdService } from '../../../shared/service/id.service';
import { FormService } from '../../../shared/service/form.service';
import { ModalDirective, BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TemplateForm } from '../../own-submissions/models/template-form';
import { DocumentToolsService } from '../../../shared-modules/document-viewer/document-tools.service';
import { take } from 'rxjs/operators'
// import { EventEmitter } from 'redlock';

@Component({
  selector: 'laji-user-document-tools',
  templateUrl: './user-document-tools.component.html',
  styleUrls: ['./user-document-tools.component.css'],
  providers: [BsModalRef],
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


  linkLocation = '';
  _editors: string[];
  _formID: string;
  _personID: string;
  _documentID: string;
  hasEditRights = false;


  @ViewChild('saveAsTemplate', { static: true }) public templateModal: ModalDirective;
  @ViewChild('deleteModal', { static: true }) public deleteModal: ModalDirective;

  constructor(
    private formService: FormService,
    private documentToolsService: DocumentToolsService,
    private modalService: BsModalService,
    private modalRef: BsModalRef,
    private cd: ChangeDetectorRef
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
    this._formID = IdService.getId(formID);
    this.updateLink();
  }

  ngOnInit() {
    this.modalService.onHide.subscribe((e) => {
      const body = document.body;
      body.classList.add("modal-open-after");
      this.documentToolsService.emitChildEvent(false);
      this.cd.detectChanges();
    });
  }

  makeTemplate() {
    // this.templateModal.show();
    this.modalRef = this.modalService.show(this.templateModal, {class: 'modal-sm tools', backdrop: true});
    this.documentToolsService.emitChildEvent(true);
  }

  makeDelete() {
    // this.deleteModal.show();
    this.modalRef = this.modalService.show(this.deleteModal, {class: 'modal-sm tools', backdrop: true});
    this.documentToolsService.emitChildEvent(true);
  }

  closeModal(event){
    if (this.modalRef) {
      this.modalRef.hide();
      const body = document.body;
      body.classList.add("modal-open-after");
    }
  }

  onClickOutside() {
    this.closeModal(event);
  }
  

  deleteDocument() {

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

  private updateLink() {
    if (!this.hasEditRights || !this._documentID || !this._formID) {
      return;
    }
    this.linkLocation = this.formService.getEditUrlPath(this._formID, this._documentID);
  }

  @HostListener('window:keydown', ['$event'])
  documentToolsKeyDown(e: KeyboardEvent) {
    if (e.keyCode === 27) {
      e.stopImmediatePropagation();
       this.closeModal(event);
      }

  }

}
