import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Form } from '../../../shared/model/Form';
import { UserService } from '../../../shared/service/user.service';
import { ILajiFormState } from '@laji-form/laji-form-document.facade';
import * as moment from 'moment';

@Component({
  selector: 'laji-document-form-header',
  templateUrl: './document-form-header.component.html',
  styleUrls: ['./document-form-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormHeaderComponent implements OnInit, OnChanges, OnDestroy {

  @Input() formID: string;
  @Input() namedPlace: any;
  @Input() isAdmin = false;
  @Input() printType: string;
  @Input() formData: any;
  @Input() displayObservationList: boolean;
  @Input() displayLatest: boolean;
  @Input() description: string;
  @Input() displayTitle = true;
  @Input() edit: boolean;

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
    private cd: ChangeDetectorRef
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

}
