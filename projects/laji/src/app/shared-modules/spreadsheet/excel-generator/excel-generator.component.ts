import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { IFormField } from '../model/excel';
import { SpreadsheetService } from '../service/spreadsheet.service';
import { GeneratorService } from '../service/generator.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'laji-excel-generator',
  templateUrl: './excel-generator.component.html',
  styleUrls: ['./excel-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcelGeneratorComponent {

  type: 'ods'|'xlsx' = 'xlsx';
  formID = '';
  formTitle?: string;
  fields: IFormField[] = [];
  parents: string[] = [];
  selected: string[] = [];
  useLabels = true;
  generating = false;

  private parentOrder = [
    'document',
    'gatheringEvent',
    'taxonCensus',
    'gatherings',
    'gatheringFact',
    'unitGathering',
    'identifications',
    'units',
    'unitFact'
  ];

  _forms: Observable<string[]> = this.formService.getGloballyAllowedSpreadsheetForms().pipe(
    map(_forms => _forms.map(form => form.id))
  );

  @Input()
  set forms(forms: string[]) {
    this._forms = of(forms);
  }

  constructor(
    private formService: FormService,
    private spreadSheetService: SpreadsheetService,
    private generatorService: GeneratorService,
    private cdr: ChangeDetectorRef
  ) { }

  formSelected(event: string) {
    const selected: string[] = [];
    this.formID = event;
    this.formService.getForm(this.formID)
      .subscribe((form) => {
        if (!form) {
          return;
        }

        this.formTitle = form.title;
        this.parents = [];
        this.fields = this.spreadSheetService.formToFlatFields(form, []);
        this.fields = this.fields.sort(
          (a, b) => this.parentOrder.indexOf(a.parent) - this.parentOrder.indexOf(b.parent)
        );
        this.fields.forEach(field => {
          if (this.parents.indexOf(field.parent) === -1) {
            this.parents.push(field.parent);
          }
          if (field.required) {
            selected.push(field.key);
          }
          if (GeneratorService.splittableFields[field.key]) {
            field.splitType = GeneratorService.splittableFields[field.key];
          }
        });
        this.selected = selected;
        this.cdr.detectChanges();
      });
  }

  toggleField(field: IFormField | IFormField[]) {
    if (this.generating) {
      return;
    }
    if (Array.isArray(field)) {
      field.forEach(value => this.toggleField(value));
      return;
    }
    if (this.selected.indexOf(field.key) === -1) {
      this.selected = this.selected.concat(field.key);
    } else {
      this.selected = this.selected.filter(val => val !== field.key || field.required);
    }
  }

  clearSelected() {
    this.selected = this.fields.reduce<string[]>((result, field) => {
      if (field.required) {
        result.push(field.key);
      }
      return result;
    }, []);
  }

  selectAll() {
    this.selected = this.fields.map(field => field.key);
  }

  generate() {
    if (!this.formID || this.generating) {
      return;
    }

    const generatedFields: IFormField[] = [];

    this.selected.forEach(selectedField => {
      const field = this.fields.find(f => f.key === selectedField);

      if (field) {
        generatedFields.push(field);
      }
    });

    this.generating = true;
    this.generatorService.generate(
      this.formID,
      'Laji - ' + this.formTitle + ' (' + this.formID + ')',
      generatedFields,
      this.useLabels,
      this.type,
      () => {
        this.generating = false;
        this.cdr.markForCheck();
      }
    );
  }

}
