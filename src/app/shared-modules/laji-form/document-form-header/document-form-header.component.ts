import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Form } from '../../../shared/model/Form';
import { UserService } from '../../../shared/service/user.service';
import { ILajiFormState } from '@laji-form/laji-form-document.facade';
import * as moment from 'moment';
import { AreaService } from '../../../shared/service/area.service';

@Component({
  selector: 'laji-document-form-header',
  templateUrl: './document-form-header.component.html',
  styleUrls: ['./document-form-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormHeaderComponent implements OnInit, OnChanges, OnDestroy {

  @Input() formID: string;
  @Input() isAdmin = false;
  @Input() printType: string;
  @Input() formData: any;
  @Input() displayObservationList: boolean;
  @Input() displayLatest: boolean;
  @Input() description: string;
  @Input() displayTitle = true;
  @Input() edit: boolean;

  namedPlaceHeader: Observable<string>[];
  _namedPlace: any;
  @Input('namedPlace')
  get namedPlace(): any {
    return this._namedPlace;
  }
  set namedPlace(np: any) {
    this._namedPlace = np;
    this.namedPlaceHeader = this._namedPlace ? this.getNamedPlaceHeader(this._namedPlace) : [];
  }

  form: any;
  useLocalDocumentViewer = false;
  editingOldWarning = false;

  vm$: Observable<ILajiFormState>;

  private subTrans: Subscription;

  constructor(
    private title: Title,
    private formService: FormService,
    private userService: UserService,
    public translate: TranslateService,
    private cd: ChangeDetectorRef,
    private areaService: AreaService
  ) { }

  ngOnInit() {
    this.updateForm();
    this.subTrans = this.translate.onLangChange.subscribe(res => {
      this.updateForm();
    });
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formID'] && !changes['formID'].isFirstChange()) {
      this.updateForm();
    }
  }

  updateForm() {
    if (!this.formID) {
      return;
    }
    this.formService.getForm(this.formID, this.translate.currentLang)
      .subscribe(form => {
        this.form = form;
        this.useLocalDocumentViewer = FormService.hasFeature(form, Form.Feature.DocumentsViewableForAll);

        if (this.edit && FormService.hasFeature(form, Form.Feature.EditingOldWarning)) {
          // ISO 8601 duration
          const {editingOldWarningDuration = 'P1W'} = form.options || {};
          const docCreateDuration = moment.duration(moment().diff(moment(this.formData.dateCreated)));
          if (moment.duration(editingOldWarningDuration).subtract(docCreateDuration).asMilliseconds() < 0) {
            this.editingOldWarning = true;
          }
        }
        this.title.setTitle(form.title + ' | ' + this.title.getTitle());
        this.cd.markForCheck();
      });
  }

  formatDate(date: string) {
    return moment(date).format('DD.MM.YYYY');
  }

  getNamedPlaceHeader(namedPlace): Observable<string>[] {
    const fields: [string, ((value: string) => Observable<string>)?][] = [
      ['alternativeIDs'], ['name'], ['municipality', val => this.areaService.getName(val, this.translate.currentLang)]
    ];
    return fields.filter(f => {
      const val = namedPlace[f[0]];
      const hasValue = v => v || v === '0' || v === 0;
      if ((hasValue(val) && !Array.isArray(val)) || (Array.isArray(val) && val.filter(hasValue).length > 0)) {
        return true;
      }
    }).map(f => {
      const val = namedPlace[f[0]];
      if ((!f[1])) {
        return of(val);
      } else {
        return f[1](val);
      }
    });
  }
}
