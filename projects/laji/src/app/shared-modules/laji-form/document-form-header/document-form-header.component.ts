import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../../shared/service/user.service';
import { ILajiFormState } from '../laji-form-document.facade';
import * as moment from 'moment';
import { AreaService } from '../../../shared/service/area.service';
import { Form } from '../../../shared/model/Form';

@Component({
  selector: 'laji-document-form-header',
  templateUrl: './document-form-header.component.html',
  styleUrls: ['./document-form-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormHeaderComponent implements OnInit, OnChanges, OnDestroy {

  @Input() formID: string;
  @Input() isAdmin = false;
  @Input() printType: string;
  @Input() formData: any;
  @Input() displayDescription = true;
  @Input() displayInstructions = true;
  @Input() displayObservationList: boolean;
  @Input() displayLatest: boolean;
  @Input() description: string;
  @Input() displayTitle = true;
  @Input() edit: boolean;

  namedPlaceHeader: string[];
  _namedPlace: any;
  @Input('namedPlace')
  get namedPlace(): any {
    return this._namedPlace;
  }
  set namedPlace(np: any) {
    this._namedPlace = np;
    this.namedPlaceHeader = this.getNamedPlaceHeader();
  }

  form: Form.SchemaForm;
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
    this.subTrans = this.translate.onLangChange.subscribe(() => {
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
        this.useLocalDocumentViewer = form.options?.documentsViewableForAll;

        if (this.edit && form.options?.warnEditingOldDocument) {
          // ISO 8601 duration
          const {warnEditingOldDocumentDuration = 'P1W'} = form.options || {};
          const docCreateDuration = moment.duration(moment().diff(moment(this.formData.dateCreated)));
          if (moment.duration(warnEditingOldDocumentDuration).subtract(docCreateDuration).asMilliseconds() < 0) {
            this.editingOldWarning = true;
          }
        }
        this.title.setTitle(form.title + ' | ' + this.title.getTitle());
        this.namedPlaceHeader = this.getNamedPlaceHeader();
        this.cd.markForCheck();
      });
  }

  formatDate(date: string) {
    return moment(date).format('DD.MM.YYYY');
  }

  getNamedPlaceHeader(): string[] {
    console.log('ciao')
    if (!this.form || !this._namedPlace) {
      return [];
    }
    return this.form.options?.namedPlaceOptions?.headerFields || ['alternativeIDs', 'name', 'municipality'];
  }
}
