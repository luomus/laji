import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { IFormField } from '../model/excel';
import { SpreadsheetService } from '../service/spreadsheet.service';
import { GeneratorService } from '../service/generator.service';
import { environment } from '../../../../environments/environment';
import { map, take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'laji-excel-generator',
  templateUrl: './excel-generator.component.html',
  styleUrls: ['./excel-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcelGeneratorComponent implements OnInit {

  type: 'ods'|'xlsx' = 'xlsx';
  formID = '';
  formTitle: string;
  fields: IFormField[] = [];
  parents: string[] = [];
  selected: string[] = [];
  useLabels = true;
  generating = false;

  private isSecondary = false;

  _forms: Observable<string[]>;

  @Input()
  set forms(forms: string[]) {
    if (forms) {
      this._forms = of(forms);
    } else {
      this._forms = this.formService.getSpreadsheetForms().pipe(map(_forms => _forms.map(form => form.id)));
    }
  }

  constructor(
    private formService: FormService,
    private translateService: TranslateService,
    private spreadSheetService: SpreadsheetService,
    private generatorService: GeneratorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.spreadSheetService.setRequiredFields('*', {
      'gatherings[*].taxonCensus[*].censusTaxonID': false,
      'gatherings[*].taxonCensus[*].taxonCensusType': false,
      'gatherings[*].units[*].identifications[*].taxon': true
    });
  }

  formSelected(event) {
    const selected: string[] = [];
    this.formID = event;
    this.formService.getForm(this.formID, this.translateService.currentLang)
      .subscribe((form) => {
        this.isSecondary = form.options?.secondaryCopy;
        this.formTitle = form.title;
        this.parents = [];
        this.fields = this.spreadSheetService.formToFlatFields(form, this.isSecondary ? [
          SpreadsheetService.IdField,
          SpreadsheetService.deleteField
        ] : []);
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
      this.selected = [...this.selected, field.key];
    } else {
      this.selected = this.selected.filter(val => val !== field.key || field.required);
    }
  }

  clearSelected() {
    this.selected = this.fields.reduce((result, field) => {
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
    this.generating = true;
    this.generatorService.generate(
      this.formID,
      'Laji - ' + this.formTitle + ' (' + this.formID + ')',
      this.selected.map(field => this.fields.find(f => f.key === field)),
      this.useLabels,
      this.type,
      () => {
        this.generating = false;
        this.cdr.markForCheck();
      }
    );
  }

}
