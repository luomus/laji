import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormField } from '../../model/form-field';
import { SpreadSheetService } from '../../service/spread-sheet.service';

@Component({
  selector: 'laji-cell-value-mapping',
  templateUrl: './cell-value-mapping.component.html',
  styleUrls: ['./cell-value-mapping.component.css']
})
export class CellValueMappingComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];
  @Input() fields: {[key: string]: FormField} = {};
  @Input() mapping: {[key: string]: string} = {};

  @Output() done = new EventEmitter();

  cols: string[];
  invalid: string[] = [];
  currentKey: string;
  allMapped = false;

  constructor(private spreadsheetService: SpreadSheetService) { }

  ngOnInit() {
    this.initCols();
    this.analyseNextColumn();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mapping'] && changes['mapping'].isFirstChange() === false) {
      this.initCols();
    }
  }

  initCols() {
    this.cols = Object.keys(this.mapping);
  }

  analyseNextColumn() {
    const current = this.cols.shift();
    if (!current) {
      this.done.emit();
      return;
    }
    const field = this.fields[this.mapping[current]];
    const invalidValues = {};
    this.data.map(row => {
      if (this.spreadsheetService.hasInvalidValue(row[current], field)) {
        invalidValues[row[current]] = true;
      }
    });
    this.invalid = Object.keys(invalidValues);
    if (this.invalid.length === 0) {
      this.analyseNextColumn();
      return;
    }
    this.allMapped = true;
    this.currentKey = current;
  }
}
