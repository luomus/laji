import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormField } from '../../model/form-field';

@Component({
  selector: 'laji-col-mapper',
  templateUrl: './col-mapper.component.html',
  styleUrls: ['./col-mapper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ColMapperComponent implements OnInit, OnChanges {

  @Input() fields: {[key: string]: FormField};
  @Input() headers: {[key: string]: string} = {};
  @Input() colMapping: {[col: string]: string} = {};
  @Output() fieldSelected = new EventEmitter<{col: string, key: string}>();
  @Output() mappingDone = new EventEmitter<{[key: string]: string}>();

  allFields: string[] = [];
  missingMapping = [];

  cols: string[];

  constructor() { }

  ngOnInit() {
    this.initCols();
    this.initAllFields();
    if (!this.missingMappings()) {
      this.mappingDone.emit(this.colMapping);
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['fields'] && change['fields'].isFirstChange() === false) {
      this.initAllFields();
    }
  }

  initCols() {
    const missing = [];
    this.cols = Object.keys(this.headers);
    this.cols.map(col => {
      if (!this.colMapping[col]) {
        missing.push(col);
      }
    });
    this.missingMapping = missing;
  }

  initAllFields() {
    this.allFields = Object.keys(this.fields);
  }

  missingMappings() {
    return this.cols.length === 0 || this.cols.length !== Object.keys(this.colMapping).length;
  }

  saveMapping() {
    this.mappingDone.emit(this.colMapping);
  }
}
