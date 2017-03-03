import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { FormService } from '../../form/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-edit',
  templateUrl: './np-edit.component.html',
  styleUrls: ['./np-edit.component.css']
})
export class NpEditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() namedPlace: NamedPlace;
  @Input() formId: string;
  @Input() collectionId: string;

  formData: any;

  @Input() editMode = false;
  @Output() onEditButtonClick = new EventEmitter();
  @Output() onEditReady = new EventEmitter();

  lang: string;

  private npFormId: string;
  private form$: Subscription;
  private translation$: Subscription;

  constructor(
    private appConfig: AppConfig,
    private formService: FormService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.npFormId = this.appConfig.getNamedPlaceFormId();
    this.fetchForm();
    this.translation$ = this.translate.onLangChange.subscribe(
      () => this.onLangChange()
    );
  }

  ngOnDestroy() {
    if (this.form$) {
      this.form$.unsubscribe();
    }
    this.translation$.unsubscribe();
  }

  ngOnChanges() {
    this.setFormData();
  }

  onLangChange() {
    if (this.form$) {
      this.form$.unsubscribe();
    }
    const data = this.formData.formData;
    this.formData = null;
    this.form$ = this.formService
      .getForm(this.npFormId, this.translate.currentLang)
      .subscribe(form => {
        form['formData'] = data;
        this.lang = this.translate.currentLang;
        this.formData = form;
      });
  }

  fetchForm() {
    if (this.form$) {
      this.form$.unsubscribe();
    }
    this.lang = this.translate.currentLang;
    this.form$ = this.formService
      .load(this.npFormId, this.lang)
      .subscribe(
        data => {
          this.setData(data);
        },
        err => {
          /*const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {npFormId: this.npFormId})
            .subscribe(data => this.errorMsg = data);*/
        }
      );
  }

  setData(data) {
    const drawData$ = this.formService
      .getFormDrawData(this.formId, this.lang)
      .subscribe(
        drawData => {
          if (drawData) {
            data['uiSchema']['namedPlace']['ui:options']['draw'] = drawData;
          }
          this.formData = data;
        },
        err => {
          // console.log(err);
        }
      );
  }

  setFormData() {
    if (!this.formData) {
      return;
    }

    if (this.namedPlace) {
      const npData = this.namedPlace;
      npData['geometryOnMap'] = {type: 'GeometryCollection', geometries: [npData.geometry]};
      this.formData.formData.namedPlace = [npData];
    } else if ('namedPlace' in this.formData.formData) {
      delete this.formData.formData['namedPlace'];
    }
  }

  editClick() {
    this.onEditButtonClick.emit();
  }

  editReady() {
    this.onEditReady.emit();
  }

  populateForm() {
    const np = this.namedPlace;

    np.prepopulatedDocument ?
      this.formService.populate(np.prepopulatedDocument) :
      this.formService.populate({gatherings: [{geometry: {type: 'GeometryCollection', geometries: [np.geometry]}}]});
  }
}
