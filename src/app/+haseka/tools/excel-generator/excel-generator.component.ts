import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { Form } from '../../../shared/model';
import { FormField } from '../model/form-field';
import { SpreadSheetService } from '../service/spread-sheet.service';

@Component({
  selector: 'laji-excel-generator',
  templateUrl: './excel-generator.component.html',
  styleUrls: ['./excel-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcelGeneratorComponent implements OnInit {

  forms$: Observable<any>;
  formID = '';
  fields: FormField[] = [];
  parents: string[] = [];
  selected: string[] = [];

  constructor(
    private formService: FormService,
    private translateService: TranslateService,
    private spreadSheetService: SpreadSheetService,
    private cdr: ChangeDetectorRef
  ) { }

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
      .subscribe((form: any) => {
        const result: FormField[] = [];
        this.parents = [];
        if (form.schema && form.schema.properties) {
          this.parserFields(form.schema, {properties: form.validators}, result, '', 'document');
        }
        this.fields = result;
        this.cdr.markForCheck();
      })
  }

  toggleField(field: FormField) {
    if (this.selected.indexOf(field.key) === -1) {
      this.selected = [...this.selected, field.key];
    } else {
      this.selected = this.selected.filter(val => val !== field.key)
    }
  }

  parserFields(form: any, validators: any, result: FormField[], root, parent, lastKey = '', lastLabel = '', required = []) {
    if (!form || !form.type) {
      return;
    }
    switch (form.type) {
      case 'object':
        if (form.properties) {
          let found = false;
          Object.keys(form.properties).map(key => {
            found = true;
            this.parserFields(
              form.properties[key],
              validators.properties && validators.properties && validators.properties[key] || {},
              result,
              root ? root + '.' + key : key,
              form.properties[key].type === 'object' && Object.keys(form.properties[key].properties).length > 0 ? key : parent,
              key,
              form.title || lastLabel,
              form.required || []
            )
          });
          if (!found) {
            result.push({
              type: form.type,
              label: form.title || lastLabel,
              key: root,
              parent: parent,
              required: this.hasRequiredValidator(lastKey, validators, required)
            });
          }
        }
        break;
      case 'array':
        if (form.items) {
          const newParent = ['object', 'array'].indexOf(form.items.type) > -1 ? lastKey : parent;
          this.parserFields(form.items, validators.items || validators, result, root + '[0]', newParent, lastKey, form.title || lastLabel);
        }
        break;
      default:
        if (this.parents.indexOf(parent) === -1) {
          this.parents.push(parent);
        }
        result.push({
          type: form.type,
          label: form.title || lastLabel,
          key: root,
          parent: parent,
          required: this.hasRequiredValidator(lastKey, validators, required)
        });
    }
  }

  hasRequiredValidator(lastKey, validator, required) {
    return !!validator.presence || (validator.geometry && validator.geometry.requireShape) || required.indexOf(lastKey) > -1;
  }

  clearSelected() {
    this.selected = [];
  }

  selectAll() {
    this.selected = this.fields.map(field => field.key);
  }

  generate() {
    this.spreadSheetService.generate(this.fields.filter(field => this.selected.indexOf(field.key) > -1 || field.required));
  }

}
