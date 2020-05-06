import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { FormService } from '../../../shared/service/form.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { DocumentService } from '../../../shared-modules/own-submissions/service/document.service';
import { NpInfoComponent } from './np-info/np-info.component';
import { Rights } from '../../../+haseka/form-permission/form-permission.service';
import { LajiFormDocumentFacade } from '@laji-form/laji-form-document.facade';

@Component({
  selector: 'laji-np-edit',
  templateUrl: './np-edit.component.html',
  styleUrls: ['./np-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpEditComponent {
  @Input() namedPlace: NamedPlace;
  @Input() formId: string;
  @Input() loading: boolean;
  @Input() prepopulatedNamedPlace: NamedPlace;
  @Input() documentForm: any;
  @Input() formRights: Rights = {
    edit: false,
    admin: false
  };

  @Input() mapOptionsData: any;
  @Input() placeForm: any;
  @Input() collectionId: string;

  @Input() editMode = false;
  @Input() allowEdit = true;
  @Output() reserve = new EventEmitter();
  @Output() release = new EventEmitter();
  @Output() editButtonClick = new EventEmitter();
  @Output() editReady = new EventEmitter();
  @Output() error = new EventEmitter();

  @ViewChild(NpInfoComponent) infoComponent: NpInfoComponent;

  constructor(
    private formService: FormService,
    private translate: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router,
    private documentService: DocumentService,
    private lajiFormFacade: LajiFormDocumentFacade
  ) { }

  npClick() {
    if (this.infoComponent) {
      this.infoComponent.npClick();
    }
  }

  editClick() {
    this.editButtonClick.emit();
  }

  useClick() {
    this.lajiFormFacade.useNamedPlace(this.namedPlace, this.formId);
    this.router.navigate(this.localizeRouterService.translateRoute([
      this.formService.getAddUrlPath(this.formId)
    ]));
  }

  setIsEdit(b: boolean) {
    if (!this.placeForm) {
      return;
    }
    if (!this.placeForm.uiSchemaContext) {
      this.placeForm.uiSchemaContext = {};
    }
    this.placeForm.uiSchemaContext.isEdit = b;
  }
}
