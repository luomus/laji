import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Form } from '../../../shared/model/Form';
import { UserService } from '../../../shared/service/user.service';

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

  form: any;
  useLocalDocumentViewer = false;

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
        this.useLocalDocumentViewer = this.form &&
          Array.isArray(this.form.features) &&
          this.form.features.indexOf(Form.Feature.DocumentsViewableForAll) > -1;
        this.title.setTitle(form.title + ' | ' + this.title.getTitle());
        this.cd.markForCheck();
      });
  }

}
