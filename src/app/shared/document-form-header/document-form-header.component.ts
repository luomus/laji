import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { FormService } from '../service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';

@Component({
  selector: 'laji-document-form-header',
  templateUrl: './document-form-header.component.html',
  styleUrls: ['./document-form-header.component.css']
})
export class DocumentFormHeaderComponent implements OnInit, OnChanges {

  @Input() formID: string;
  @Input() namedPlaceID: string;
  @Input() printType: string;
  form: any;

  constructor(
    private formService: FormService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.updateForm();
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
      .subscribe(form => this.form = form);
  }

}
