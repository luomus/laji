import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormService } from '../../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { IFormField } from '../model/excel';
import { SpreadSheetService } from '../service/spread-sheet.service';
import { GeneratorService } from '../service/generator.service';

@Component({
  selector: 'laji-excel-generator',
  templateUrl: './excel-generator.component.html',
  styleUrls: ['./excel-generator.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcelGeneratorComponent implements OnInit {

  type: 'ods'|'xlsx' = 'xlsx';
  forms$: Observable<any>;
  formID = '';
  formTitle: string;
  fields: IFormField[] = [];
  parents: string[] = [];
  selected: string[] = [];
  useLabels = true;
  generating = false;

  constructor(
    private formService: FormService,
    private translateService: TranslateService,
    private spreadSheetService: SpreadSheetService,
    private generatorService: GeneratorService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.spreadSheetService.setRequiredFields({
      'gatherings[*].taxonCensus[*].censusTaxonID': false,
      'gatherings[*].taxonCensus[*].taxonCensusType': false,
      'gatherings[*].units[*].identifications[*].taxon': true
    });
  }

  formSelected(event) {
    this.formID = event.id;
    this.formService.getForm(this.formID, this.translateService.currentLang)
      .subscribe((form: any) => {
        this.formTitle = form.title;
        this.parents = [];
        this.fields = this.spreadSheetService.formToFlatFields(form);
        this.fields.map(field => {
          if (this.parents.indexOf(field.parent) === -1) {
            this.parents.push(field.parent);
          }
        });
        this.cdr.markForCheck();
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
      this.selected = this.selected.filter(val => val !== field.key);
    }
  }

  clearSelected() {
    this.selected = [];
  }

  selectAll() {
    this.selected = this.fields.map(field => field.key);
  }

  generate() {
    this.generating = true;
    this.generatorService.generate(
      this.formID,
      'Vihko - ' + this.formTitle + ' (' + this.formID + ')',
      this.fields.filter(field => this.selected.indexOf(field.key) > -1 || field.required),
      this.useLabels,
      this.type,
      () => {
        this.generating = false;
        this.cdr.markForCheck();
      }
    );
  }

}
