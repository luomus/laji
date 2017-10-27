import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit,
  SimpleChanges
} from '@angular/core';
import { FormService } from '../service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'laji-document-form-header',
  templateUrl: './document-form-header.component.html',
  styleUrls: ['./document-form-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormHeaderComponent implements OnInit, OnChanges, OnDestroy {

  @Input() formID: string;
  @Input() namedPlaceID: string;
  @Input() printType: string;
  @Input() includeNpDescription = false;

  form: any;

  private subTrans: Subscription;

  constructor(
    private title: Title,
    private formService: FormService,
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
        this.title.setTitle(form.title + ' | ' + this.title.getTitle());
        this.cd.markForCheck();
      });
  }

}
