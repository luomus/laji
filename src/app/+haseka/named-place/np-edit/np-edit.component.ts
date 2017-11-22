import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { Util } from '../../../shared/service/util.service';
import { FormService } from '../../../shared/service/form.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { DocumentService } from '../../../shared-modules/own-submissions/service/document.service';
import { NpInfoComponent } from './np-info/np-info.component';

@Component({
  selector: 'laji-np-edit',
  templateUrl: './np-edit.component.html',
  styleUrls: ['./np-edit.component.css']
})
export class NpEditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() namedPlace: NamedPlace;
  @Input() formId: string;
  @Input() prepopulatedNamedPlace: string;
  @Input() formData: any;

  drawData: any;
  npFormData: any;

  @Input() editMode = false;
  @Input() allowEdit = true;
  @Output() onEditButtonClick = new EventEmitter();
  @Output() onEditReady = new EventEmitter();
  @Output() onError = new EventEmitter();

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
    private documentService: DocumentService
  ) { }

  ngOnInit() {
    this.npFormId = environment.namedPlaceForm;
    this.fetchForm();
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.onLangChange()
    );
    this.drawData = this.getDrawData();
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
        if (this.drawData) {
          form['uiSchema']['namedPlace']['ui:options']['draw'] = this.drawData;
        }
        this.lang = this.translate.currentLang;
        this.npFormData = form;
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
          if (this.drawData) {
            data['uiSchema']['namedPlace']['ui:options']['draw'] = this.drawData;
          }
          this.npFormData = data;
          this.setFormData();
        },
        err => {
          const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
           this.translate.get(msgKey, {formId: this.npFormId})
           .subscribe(msg => this.onError.emit(msg));
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

      this.npFormData.formData.namedPlace = [npData];
    } else {
      this.npFormData.formData.namedPlace = [this.prepopulatedNamedPlace];
    }
  }

  editClick() {
    this.onEditButtonClick.emit();
  }

  useClick() {
    this.populateForm();
    this.router.navigate(this.localizeRouterService.translateRoute([
      this.formService.getAddUrlPath(this.formId)
    ]));
  }

  editReady(np: NamedPlace) {
    this.onEditReady.emit(np);
  }

  private populateForm() {
    const np = this.namedPlace;
    const populate: any = np.prepopulatedDocument ? Util.clone(np.prepopulatedDocument) : {};

    populate.namedPlaceID = np.id;

    if (!populate.gatherings) {
      populate.gatherings = [{}];
    } else if (!populate.gatherings[0]) {
      populate.gatherings[0] = {};
    }
    if (!populate.gatherings[0].geometry) {
      populate.gatherings[0]['geometry'] = {type: 'GeometryCollection', geometries: [np.geometry]};
    }
    if (this.namedPlace.notes) {
      if (!populate.gatheringEvent) {
        populate.gatheringEvent = {};
      }
      populate.gatheringEvent.namedPlaceNotes = this.namedPlace.notes;
    }

    this.formService.populate(this.documentService.removeMeta(populate, DocumentService.removableGathering));
  }

  private getDrawData() {
    const form = this.formData;

    if (!form.uiSchema) {
      return null;
    }

    if (form.uiSchema.gatherings) {
      if (form.uiSchema.gatherings['ui:options'] && form.uiSchema.gatherings['ui:options']['draw']) {
        return form.uiSchema.gatherings['ui:options']['draw'];
      } else {
        return null;
      }
    } else {
      return this.getObjectByKey(form.uiSchema, 'draw');
    }
  }

  private getObjectByKey(obj, key) {
    let foundObject = null;

    for (const i in obj) {
      if (!obj.hasOwnProperty(i) || typeof  obj[i] !== 'object') {
        continue;
      }

      if (i === key) {
        foundObject = obj[i];
      } else if (typeof obj[i] === 'object') {
        foundObject = this.getObjectByKey(obj[i], key);
      }

      if (foundObject !== null) {
        break;
      }
    }
    return foundObject;
  }
}
