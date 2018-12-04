import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { Util } from '../../../shared/service/util.service';
import { FormService } from '../../../shared/service/form.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { DocumentService } from '../../../shared-modules/own-submissions/service/document.service';
import { NpInfoComponent } from './np-info/np-info.component';
import { Rights } from '../../../+haseka/form-permission/form-permission.service';

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
  @Input() prepopulatedNamedPlace: string;
  @Input() formData: any;
  @Input() namedPlaceOptions: any;
  @Input() formRights: Rights = {
    edit: false,
    admin: false
  };

  @Input() mapOptionsData: any;
  @Input() npFormData: any;

  @Input() editMode = false;
  @Input() allowEdit = true;
  @Input() lang: string;
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
    private documentService: DocumentService
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
    this.populateForm();
    this.router.navigate(this.localizeRouterService.translateRoute([
      this.formService.getAddUrlPath(this.formId)
    ]));
  }

  private populateForm() {
    const np = this.namedPlace;
    const populate: any = np.acceptedDocument ?
      Util.clone(np.acceptedDocument) : (np.prepopulatedDocument ? Util.clone(np.prepopulatedDocument) : {});

    populate.namedPlaceID = np.id;

    if (!populate.gatherings) {
      populate.gatherings = [{}];
    } else if (!populate.gatherings[0]) {
      populate.gatherings[0] = {};
    }
    if (this.namedPlace.notes) {
      if (!populate.gatheringEvent) {
        populate.gatheringEvent = {};
      }
      populate.gatheringEvent.namedPlaceNotes = this.namedPlace.notes;
    }

    let removeList = this.formData.excludeFromCopy || DocumentService.removableGathering;
    if (this.formData.namedPlaceOptions && this.formData.namedPlaceOptions.includeUnits) {
      removeList = removeList.filter(item => item !== 'units');
    }
    this.formService.populate(this.documentService.removeMeta(populate, removeList));
  }

  setIsEdit(b: boolean) {
    if (!this.npFormData) {
      return;
    }
    if (!this.npFormData.uiSchemaContext) {
      this.npFormData.uiSchemaContext = {};
    }
    this.npFormData.uiSchemaContext.isEdit = b;
  }
}
