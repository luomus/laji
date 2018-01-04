import { Component, OnInit } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Form } from '../../../shared/model';

interface FormField {
  label: string;
  key: string;
  parent: string;
}

@Component({
  selector: 'laji-excel-generator',
  templateUrl: './excel-generator.component.html',
  styleUrls: ['./excel-generator.component.css']
})
export class ExcelGeneratorComponent implements OnInit {

  forms$: Observable<Form>;
  formID = '';
  fields: FormField[] = [];

  constructor(private formService: FormService, private translateService: TranslateService) { }

  ngOnInit() {
    this.forms$ = this.formService.getAllForms(this.translateService.currentLang)
      .map(forms => forms.sort((a, b) => a.title.localeCompare(b.title)))
  }

  formSelected(event) {
    this.formID = event;
    this.initFormFeilds();
  }

  initFormFeilds() {
    this.formService.getForm(this.formID, this.translateService.currentLang)
      .subscribe((form: Form) => {
        const result: FormField[] = [];
        if (form.schema && form.schema.properties) {
          this.parserFields(form.schema, result);
        }
        this.fields = result;
      })
  }

  parserFields(form: any, result: FormField[], root = '', parent = 'document', lastKey = '') {
    if (!form || !form.type) {
      return;
    }
    switch (form.type) {
      case 'object':
        if (form.properties) {
          Object.keys(form.properties).map(key => {
            const newParent = form.properties[key].type === 'object' ? key : parent;
            this.parserFields(form.properties[key], result, root ? root + '[' + key + ']' : key, newParent, key)
          });
        }
        break;
      case 'array':
        if (form.items) {
          const newParent = ['object', 'array'].indexOf(form.items.type) > -1 ? lastKey : parent;
          this.parserFields(form.items, result, root + '[0]', newParent, lastKey);
        }
        break;
      default:
        result.push({label: form.title, key: root, parent: parent})
    }
  }

}
