import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DELETE_FIELD, IFormField, VALUE_IGNORE } from '../../model/excel';

@Component({
  selector: 'laji-col-mapper',
  templateUrl: './col-mapper.component.html',
  styleUrls: ['./col-mapper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColMapperComponent implements OnChanges {

  @Input() fields: {[key: string]: IFormField};
  @Input() headers: {[key: string]: string} = {};
  @Input() colMapping: {[col: string]: string} = {};
  @Output() fieldSelected = new EventEmitter<{col: string; key: string; userValue: string}>();
  @Output() mappingDone = new EventEmitter<{[key: string]: string}>();

  allFields: string[] = [];
  allCols: string[] = [];
  duplicates: string[] = [];
  duplicateLabels: string[] = [];
  missingRequiredLabels: string[] = [];
  missingMapping: string[] = [];
  hasInitMapping: {[col: string]: boolean} = {};
  init = false;
  linkedVisible = false;

  cols: string[];

  ngOnChanges() {
    if (!this.headers) {
      return;
    }

    this.initAllFields();
    this.missingRequiredLabels = this.getMissingRequiredLabels();
    this.duplicates = this.getDuplicates();
    this.duplicateLabels = this.duplicates.map(key => this.fields[key].fullLabel);

    if (!this.init) {
      this.initCols();
      if (!this.missingMappings() && this.missingRequiredLabels.length === 0 && this.duplicateLabels.length === 0) {
        this.mappingDone.emit(this.colMapping);
      }
      this.init = true;
    }
  }

  initCols() {
    const all = [];
    const missing = [];
    const hasMapping = {};
    this.cols = Object.keys(this.headers);
    this.cols.map(col => {
      all.push(col);
      hasMapping[col] = !!this.colMapping[col];
      if (!hasMapping[col]) {
        missing.push(col);
      }
    });
    this.allCols = all;
    this.missingMapping = missing;
    this.hasInitMapping = hasMapping;
  }

  initAllFields() {
    this.allFields = Object.keys(this.fields);
  }

  missingMappings() {
    return this.cols && (this.cols.length === 0 || this.cols.length !== Object.keys(this.colMapping).length);
  }

  getDuplicates(): string[] {
    const duplicates = Object.values(this.colMapping).reduce((result, value, i, array) => {
      if (array.indexOf(value) !== i && !result.includes(value)) {
        result.push(value);
      }
      return result;
    }, []);

    return this.allFields.filter(
      key => duplicates.includes(key) && !this.fields[key].isArray && key !== VALUE_IGNORE
    );
  }

  getMissingRequiredLabels(): string[] {
    const fields = Object.values(this.colMapping);
    if (fields.includes(DELETE_FIELD)) {
      return [];
    }
    const requiredFields = this.allFields.filter(key => this.fields[key].required);
    return requiredFields.filter(field => !fields.includes(field)).map(key => this.fields[key].fullLabel);
  }

  saveMapping() {
    this.mappingDone.emit(this.colMapping);
  }
}
