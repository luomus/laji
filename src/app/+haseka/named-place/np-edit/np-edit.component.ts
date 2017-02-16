import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { FormService } from '../../form/form.service';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from "rxjs";
import { NamedPlace } from '../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-edit',
  templateUrl: './np-edit.component.html',
  styleUrls: ['./np-edit.component.css']
})
export class NpEditComponent implements OnInit, OnChanges {
  @Input() namedPlaces: NamedPlace[];
  @Input() activeNP = -1;
  @Input() formId: string;

  namedPlace: NamedPlace;
  formData: any;

  @Input() editMode = false;
  loading = true;
  lang: string;

  private npFormId: string;
  private form$: Subscription;

  constructor(
    private appConfig: AppConfig,
    private formService: FormService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.npFormId = this.appConfig.getNamedPlaceFormId();
    this.fetchForm();
  }

  ngOnChanges() {
    if (this.namedPlaces && this.activeNP >= 0) {
      this.namedPlace = this.namedPlaces[this.activeNP];
    }
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
          this.formData = data;
        },
        err => {
          this.loading = false;
          /*const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {npFormId: this.npFormId})
            .subscribe(data => this.errorMsg = data);*/
        }
      );
  }

  populateForm() {
    const np = this.namedPlaces[this.activeNP];

    np.prepopulatedDocument ?
      this.formService.populate(np.prepopulatedDocument) :
      this.formService.populate({gatherings: [{geometry: {type: 'GeometryCollection', geometries: [np.geometry]}}]});
  }
}
