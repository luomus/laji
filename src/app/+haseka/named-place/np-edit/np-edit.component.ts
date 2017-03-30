import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { Util } from '../../../shared/service/util.service';
import { FormService } from '../../../shared/service/form.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-np-edit',
  templateUrl: './np-edit.component.html',
  styleUrls: ['./np-edit.component.css']
})
export class NpEditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() namedPlace: NamedPlace;
  @Input() formId: string;
  @Input() collectionId: string;
  @Input() formInfo: any;
  @Input() mobile: false;

  npFormData: any;

  @Input() editMode = false;
  @Output() onEditButtonClick = new EventEmitter();
  @Output() onEditReady = new EventEmitter();
  @Output() onError = new EventEmitter();

  lang: string;

  private npFormId: string;
  private npForm$: Subscription;
  private translation$: Subscription;

  constructor(
    private formService: FormService,
    private translate: TranslateService,
    private router: Router
  ) { }

  ngOnInit() {
    this.npFormId = environment.namedPlaceForm;
    this.fetchForm();
    this.translation$ = this.translate.onLangChange.subscribe(
      () => this.onLangChange()
    );
  }

  ngOnDestroy() {
    if (this.npForm$) {
      this.npForm$.unsubscribe();
    }
    this.translation$.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['namedPlace']) {
      this.setFormData();
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
        if (this.formInfo.drawData) {
          form['uiSchema']['namedPlace']['ui:options']['draw'] = this.formInfo.drawData;
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
          if (this.formInfo.drawData) {
            data['uiSchema']['namedPlace']['ui:options']['draw'] = this.formInfo.drawData;
          }
          this.npFormData = data;
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

      npData['geometryOnMap'] = {type: 'GeometryCollection', geometries: [npData.geometry]};

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
      this.npFormData.formData.namedPlace = [{ 'collectionID': this.collectionId }];
    }
  }

  editClick() {
    this.onEditButtonClick.emit();
  }

  useClick() {
    this.populateForm();
    this.router.navigate(['/vihko/' + this.formId]);
  }

  editReady(np: NamedPlace) {
    this.onEditReady.emit(np);
  }

  private populateForm() {
    const np = this.namedPlace;

    const populate: any = np.prepopulatedDocument ? np.prepopulatedDocument : {};

    if (!populate.gatherings) {
      populate.gatherings = [{}];
    } else if (!populate.gatherings[0]) {
      populate.gatherings[0] = {};
    }
    if (!populate.gatherings[0].geometry) {
      populate.gatherings[0]['geometry'] = {type: 'GeometryCollection', geometries: [np.geometry]};
    }

    this.formService.populate(populate);
  }
}
