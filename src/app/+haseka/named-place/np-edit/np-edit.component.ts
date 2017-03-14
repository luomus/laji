import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AppConfig } from '../../../app.config';
import { FormService } from '../../form/form.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../shared/service/user.service';
import { Subscription } from 'rxjs/Subscription';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { Util } from '../../../shared/service/util.service';

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

  formData: any;
  userId: string;

  editButtonVisible: boolean;
  useButtonVisible: boolean;

  @Input() editMode = false;
  @Output() onEditButtonClick = new EventEmitter();
  @Output() onEditReady = new EventEmitter();
  @Output() onError = new EventEmitter();

  lang: string;

  private npFormId: string;
  private form$: Subscription;
  private translation$: Subscription;

  constructor(
    private appConfig: AppConfig,
    private formService: FormService,
    private translate: TranslateService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.npFormId = this.appConfig.getNamedPlaceFormId();
    this.fetchForm();
    this.translation$ = this.translate.onLangChange.subscribe(
      () => this.onLangChange()
    );
    this.userService.getUser().subscribe(data => { this.userId = data.id; });
  }

  ngOnDestroy() {
    if (this.form$) {
      this.form$.unsubscribe();
    }
    this.translation$.unsubscribe();
  }

  ngOnChanges() {
    this.setFormData();
    this.setButtonVisibilities();
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
        if (this.formInfo.drawData) {
          form['uiSchema']['namedPlace']['ui:options']['draw'] = this.formInfo.drawData;
        }
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
          if (this.formInfo.drawData) {
            data['uiSchema']['namedPlace']['ui:options']['draw'] = this.formInfo.drawData;
          }
          this.formData = data;
        },
        err => {
          const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
           this.translate.get(msgKey, {formId: this.npFormId})
           .subscribe(msg => this.onError.emit(msg));
        }
      );
  }

  setFormData() {
    if (!this.formData || !this.userId) {
      return;
    }

    if (this.namedPlace) {
      const npData = Util.clone(this.namedPlace);

      npData['geometryOnMap'] = {type: 'GeometryCollection', geometries: [npData.geometry]};

      if (npData.prepopulatedDocument && npData.prepopulatedDocument.gatherings && npData.prepopulatedDocument.gatherings.length > 0) {
        const gathering = npData.prepopulatedDocument.gatherings[0];
        if (gathering.locality) {
          npData['locality'] = gathering.locality;
        }
        if (gathering.localityDescription) {
          npData['localityDescription'] = gathering.localityDescription;
        }
      }

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

    const populate: any = np.prepopulatedDocument ? np.prepopulatedDocument : {};

    if (!populate.gatherings || populate.gatherings.length <= 0) {
      populate['gatherings'] = [{}];
    }

    populate.gatherings[0]['geometry'] = {type: 'GeometryCollection', geometries: [np.geometry]};

    this.formService.populate(populate);
  }

  private setButtonVisibilities() {
    if (this.namedPlace) {
      this.editButtonVisible = (this.namedPlace.owners && this.namedPlace.owners.indexOf(this.userId) !== -1);
      this.useButtonVisible = (this.namedPlace.public ||
      (this.namedPlace.owners && this.namedPlace.owners.indexOf(this.userId) !== -1) ||
      (this.namedPlace.editors && this.namedPlace.editors.indexOf(this.userId) !== -1));
    }
  }
}
