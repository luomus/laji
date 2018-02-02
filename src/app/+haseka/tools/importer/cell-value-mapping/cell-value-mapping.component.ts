import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { FormField } from '../../model/form-field';
import { ImportService } from '../../service/import.service';
import { MappingService, SpeciesTypes } from '../../service/mapping.service';

@Component({
  selector: 'laji-cell-value-mapping',
  templateUrl: './cell-value-mapping.component.html',
  styleUrls: ['./cell-value-mapping.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    const analyzed = {};
    this.data.map(row => {
      if (!row[current] || analyzed[row[current]]) {
        return;
      }
      analyzed[row[current]] = true;
      const rawValue = this.mappingService.rawValueToArray(row[current], this.field);
      if (Array.isArray(rawValue)) {
        rawValue.forEach((value) => {
          if (this.importService.hasInvalidValue(value, this.field)) {
            invalidValues[value] = true;
          }
        });
      } else if (this.importService.hasInvalidValue(rawValue, this.field)) {
        invalidValues[rawValue] = true;
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
    const mapped = Object.keys(mapping);
    const intersection = this.invalid.filter((val) => mapped.indexOf(val) === -1);
    if (intersection.length === 0) {
      this.allMapped = true;
    }
  }
}
