import { Component, AfterViewInit, OnChanges, Input } from '@angular/core';
import { FormService } from '../../+haseka/form/form.service';
import { TranslateService } from '@ngx-translate/core/src/translate.service';

@Component({
  selector: 'laji-theme-form',
  templateUrl: './theme-form.component.html',
  styleUrls: ['./theme-form.component.css']
})
export class ThemeFormComponent implements AfterViewInit, OnChanges {

  @Input() formId;
  formData;

  private currentFormId;

  constructor(
    private formService: FormService,
    public translate: TranslateService
  ) { }

  ngAfterViewInit() {
    this.updateForm();
  }

  ngOnChanges() {
    this.updateForm();
  }

  updateForm() {
    if (this.currentFormId === this.formId) {
      return;
    }
    this.currentFormId = this.formId;
    this.formService
      .load(this.formId, this.translate.currentLang)
      .subscribe(formData => this.formData = formData);
  }

}
