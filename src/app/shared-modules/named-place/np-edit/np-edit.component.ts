import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { Util } from '../../../shared/service/util.service';
import { FormService } from '../../../shared/service/form.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { DocumentService } from '../../../shared-modules/own-submissions/service/document.service';
import { NpInfoComponent } from './np-info/np-info.component';
import { FormPermissionService, Rights } from '../../../+haseka/form-permission/form-permission.service';
import { UserService } from '../../../shared/service/user.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { Logger } from '../../../shared/logger/logger.service';

@Component({
  selector: 'laji-np-edit',
  templateUrl: './np-edit.component.html',
  styleUrls: ['./np-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpEditComponent implements OnInit, OnChanges, OnDestroy {
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

  mapOptionsData: any;
  npFormData: any;

  @Input() editMode = false;
  @Input() allowEdit = true;
  @Output() reserve = new EventEmitter();
  @Output() release = new EventEmitter();
  @Output() editButtonClick = new EventEmitter();
  @Output() editReady = new EventEmitter();
  @Output() error = new EventEmitter();

  lang: string;

  private npFormId: string;
  private npForm$: Subscription;
  private subTrans: Subscription;

  @ViewChild(NpInfoComponent) infoComponent: NpInfoComponent;

  constructor(
    private formService: FormService,
    private translate: TranslateService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router,
    private documentService: DocumentService,
    private formPermissionService: FormPermissionService,
    private userService: UserService,
    private toastsService: ToastsService,
    private logger: Logger,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.npFormId = this.formData.namedPlaceOptions
      && this.formData.namedPlaceOptions.formID
      || environment.namedPlaceForm;
    this.mapOptionsData = this.getMapOptions();
    this.fetchForm();
    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.onLangChange();
        this.cdr.markForCheck();
      }
    );
  }

  ngOnDestroy() {
    if (this.npForm$) {
      this.npForm$.unsubscribe();
    }
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlace']) {
      this.setFormData();
    }
  }

  npClick() {
    if (this.infoComponent) {
      this.infoComponent.npClick();
    }
  }

  onLangChange() {
    if (this.npForm$) {
      this.npForm$.unsubscribe();
    }
    const data = this.npFormData.formData;
    this.npFormData = null;
    this.npForm$ = this.formService
      .getForm(this.npFormId, this.translate.currentLang)
      .subscribe(form => {
        form['formData'] = data;
        if (this.mapOptionsData) {
          form['uiSchema']['geometry']['ui:options']['mapOptions'] = this.mapOptionsData;
        }
        this.lang = this.translate.currentLang;
        this.npFormData = form;
        this.cdr.markForCheck();
      });
  }

  fetchForm() {
    if (this.npForm$) {
      this.npForm$.unsubscribe();
    }
    this.lang = this.translate.currentLang;
    this.npForm$ = this.formService
      .load(this.npFormId, this.lang)
      .subscribe(
        data => {
          if (this.mapOptionsData) {
            data['uiSchema']['geometry']['ui:options']['mapOptions'] = this.mapOptionsData;
          }
          this.npFormData = data;
          this.setFormData();
          this.cdr.markForCheck();
        },
        err => {
          const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
           this.translate.get(msgKey, {formId: this.npFormId})
           .subscribe(msg => {
             this.error.emit(msg);
             this.cdr.markForCheck();
           });
        }
      );
  }

  setFormData() {
    if (!this.npFormData) {
      return;
    }

    if (this.namedPlace) {
      const npData = Util.clone(this.namedPlace);

      npData['geometry'] = {type: 'GeometryCollection', geometries: [npData.geometry]};

      if (npData.prepopulatedDocument && npData.prepopulatedDocument.gatherings && npData.prepopulatedDocument.gatherings[0]) {
        const gathering = npData.prepopulatedDocument.gatherings[0];
        if (gathering.locality) {
          npData['locality'] = gathering.locality;
        }
        if (gathering.localityDescription) {
          npData['localityDescription'] = gathering.localityDescription;
        }
      }

      this.npFormData.formData = npData;
    } else {
      this.npFormData.formData = this.prepopulatedNamedPlace;
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

  private getMapOptions() {
    const uiSchema = this.formData.uiSchema;

    if (!uiSchema) {
      return null;
    }

    return this.findObjectByKey(uiSchema, 'mapOptions', ['gatherings', 'uiSchema', 'ui:options']);
  }

  private findObjectByKey(obj, key, allowedObjectsInPath, recursionLimit = 5) {
    if (recursionLimit <= 0) {
      return null;
    }

    let foundObject = null;

    for (const i in obj) {
      if (!obj.hasOwnProperty(i) || typeof  obj[i] !== 'object') {
        continue;
      }

      if (i === key) {
        foundObject = obj[i];
      } else if (typeof obj[i] === 'object' && allowedObjectsInPath.indexOf(i) !== -1) {
        foundObject = this.findObjectByKey(obj[i], key, allowedObjectsInPath, recursionLimit - 1);
      }

      if (foundObject !== null) {
        break;
      }
    }
    return foundObject;
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
