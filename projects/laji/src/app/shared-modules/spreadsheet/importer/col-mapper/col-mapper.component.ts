import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IFormField, VALUE_IGNORE } from '../../model/excel';

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
  @Output() fieldSelected = new EventEmitter<{col: string, key: string, userValue: string}>();
  @Output() mappingDone = new EventEmitter<{[key: string]: string}>();

  allFields: string[] = [];
  allCols: string[] = [];
  duplicateLabels: string[] = [];
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
    this.duplicateLabels = this.getDuplicateLabels();

    if (!this.init) {
      this.initCols();
      if (!this.missingMappings() && this.duplicateLabels.length === 0) {
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

  getDuplicateLabels(): string[] {
    const duplicates = Object.values(this.colMapping).reduce((result, value, i, array) => {
      if (array.indexOf(value) !== i && !result.includes(value)) {
        result.push(value);
      }
      return result;
    }, []);

    return this.allFields.filter(
      key => duplicates.includes(key) && !this.fields[key].isArray && key !== VALUE_IGNORE
    ).map(key => this.fields[key].fullLabel);
  }

  saveMapping() {
    this.mappingDone.emit(this.colMapping);
  }
}
