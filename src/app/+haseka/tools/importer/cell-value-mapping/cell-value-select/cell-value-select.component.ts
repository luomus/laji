import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormField, IGNORE_VALUE } from '../../../model/form-field';
import { MappingService, SpeciesTypes } from '../../../service/mapping.service';
import { LajiMapOptions } from '../../../../../shared-modules/map/map-options.interface';
import { Map3Component } from '../../../../../shared-modules/map/map.component';

@Component({
  selector: 'laji-cell-value-select',
  templateUrl: './cell-value-select.component.html',
  styleUrls: ['./cell-value-select.component.css']
})
export class CellValueSelectComponent implements OnInit {

  @ViewChild(Map3Component)
  lajiMap: Map3Component;
  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  specials = SpeciesTypes;
  lajiMapOptions: LajiMapOptions = {
    draw: {
      marker: true,
      polyline: true,
      polygon: true,
      circle: true,
      rectangle: true,
      copy: true,
      upload: true,
      undo: true,
      redo: true,
      clear: true,
      delete: true,
      reverse: true,
      coordinateInput: true
    },
    controls: true
  };

  _field: FormField;
  labels: string[] = [];
  ignore = IGNORE_VALUE;
  special = null;
  booleanValues = [IGNORE_VALUE, 'true', 'false'];

  constructor(private mappingService: MappingService) { }

  @Input() set field(field: FormField) {
    this._field = field;
    this.labels = [];
    this.special = this.mappingService.getSpecial(field);

    if (this.special === SpeciesTypes.geometry) {
      setTimeout(() => {
        console.log('INVALIDATE SIZE');
        this.lajiMap.invalidateSize();
      }, 1000);
    }

    if (field.enum) {
      this.labels = [IGNORE_VALUE, ...field.enumNames];
    }
  }

  ngOnInit() {
  }

  valueMapped(value, to) {
    const mapping = {...this.mapping};

    if (to === IGNORE_VALUE) {
      mapping[value] = to;
    } else if (this._field.enumNames) {
      const idx = this._field.enumNames.indexOf(to);
      if (idx > -1) {
        mapping[value] = this._field.enum[idx];
      }
    } else if (this._field.type === 'boolean') {
      mapping[value] = to === 'true';
    } else if (typeof to !== 'undefined') {
      mapping[value] = to;
    }
    this.mappingChanged.emit(mapping);
  }
}
