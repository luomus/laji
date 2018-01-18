import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormField } from '../../model/form-field';
import { ImportService } from '../../service/import.service';
import { MappingService, SpeciesTypes } from '../../service/mapping.service';

@Component({
  selector: 'laji-cell-value-mapping',
  templateUrl: './cell-value-mapping.component.html',
  styleUrls: ['./cell-value-mapping.component.css']
})
export class CellValueMappingComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];
  @Input() fields: {[key: string]: FormField} = {};
  @Input() colMapping: {[key: string]: string} = {};

  @Output() done = new EventEmitter<{[key: string]: {[value: string]: string}}>();
  specials = SpeciesTypes;
  special = null;
  cols: string[];
  invalid: string[] = [];
  currentKey: string;
  allMapped = false;
  field: FormField;
  valueMap: {[key: string]: {[value: string]: any}} = {};

  constructor(
    private importService: ImportService,
    private mappingService: MappingService
  ) { }

  ngOnInit() {
    this.initCols();
    this.analyseNextColumn();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['colMapping'] && changes['colMapping'].isFirstChange() === false) {
      this.initCols();
    }
  }

  initCols() {
    this.cols = Object.keys(this.colMapping);
  }

  analyseNextColumn() {
    const current = this.cols.shift();
    if (!current) {
      this.done.emit(this.valueMap);
      return;
    }
    this.field = this.fields[this.colMapping[current]];
    this.special = this.mappingService.getSpecial(this.field);
    const invalidValues = {};
    this.data.map(row => {
      if (!row[current]) {
        return;
      }
      if (this.importService.hasInvalidValue(row[current], this.field)) {
        invalidValues[row[current]] = true;
      }
    });
    this.invalid = Object.keys(invalidValues);
    if (this.invalid.length === 0) {
      this.analyseNextColumn();
      return;
    }
    this.allMapped = false;
    this.currentKey = current;
    this.valueMap[this.field.key] = {};
  }

  onMapping(mapping) {
    this.valueMap[this.field.key] = mapping;
    if (Object.keys(mapping).length === this.invalid.length) {
      this.allMapped = true;
    }
  }
}
