import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { IFormField } from '../../model/excel';
import { ImportService } from '../../service/import.service';
import { MappingService, SpecialTypes } from '../../service/mapping.service';

@Component({
  selector: 'laji-cell-value-mapping',
  templateUrl: './cell-value-mapping.component.html',
  styleUrls: ['./cell-value-mapping.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CellValueMappingComponent implements OnInit, OnChanges {

  @Input({ required: true }) formID!: string;
  @Input() data: any[] = [];
  @Input() fields: {[key: string]: IFormField} = {};
  @Input() colMapping: {[key: string]: string} = {};
  @Input() valueMap: {[key: string]: {[value: string]: any}} = {};

  @Output() done = new EventEmitter<{[key: string]: {[value: string]: string}}>();
  specials = SpecialTypes;
  special: SpecialTypes | null = null;
  cols!: string[];
  invalid: string[] = [];
  currentKey?: string;
  allMapped = false;
  field!: IFormField;

  constructor(
    private importService: ImportService,
    private mappingService: MappingService,
    private cdr: ChangeDetectorRef
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
    const invalidValues: Record<string, any> = {};
    const analyzed: Record<string, any> = {};
    this.data.map(row => {
      if (row[current] === undefined || analyzed[row[current]]) {
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
        invalidValues[String(rawValue)] = true;
      }
    });
    this.invalid = Object.keys(invalidValues);
    if (this.invalid.length === 0) {
      this.analyseNextColumn();
      return;
    }

    if (this.field.required) {
      this.allMapped = false;
    } else {
      this.allMapped = true;
    }
    this.currentKey = current;
    this.valueMap[this.field.key] = {};
  }

  onMapping(mapping: Record<string, unknown>) {
    this.valueMap[this.field.key] = mapping;
    const mapped = Object.keys(mapping);
    const intersection = this.invalid.filter((val) => mapped.indexOf(val) === -1);
    if (intersection.length === 0) {
      this.allMapped = true;
    }
    this.cdr.detectChanges();
  }
}
