import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormField } from '../../model/form-field';

@Component({
  selector: 'laji-cell-value-mapping',
  templateUrl: './cell-value-mapping.component.html',
  styleUrls: ['./cell-value-mapping.component.css']
})
export class CellValueMappingComponent implements OnInit, OnChanges {

  @Input() data: any[] = [];
  @Input() fields: {[key: string]: FormField} = {};
  @Input() mapping: {[key: string]: string} = {};

  cols: string[];
  mappingDone = false;
  currentKey;

  constructor() { }

  ngOnInit() {
    this.initCols();
    this.analyseNextColumn();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fields'] && changes['fields'].isFirstChange() === false) {
      this.initCols();
    }
  }

  initCols() {
    this.cols = Object.keys(this.fields);
  }

  analyseNextColumn() {

  }

  saveMapping() {

  }

}
