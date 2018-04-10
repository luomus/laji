import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormField, VALUE_IGNORE } from '../../../model/form-field';

@Component({
  selector: 'laji-special-taxon-name',
  templateUrl: './special-taxon-name.component.html',
  styleUrls: ['./special-taxon-name.component.css']
})
export class SpecialTaxonNameComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: FormField;
  @Input() addTaxonIDTo = 'gatherings[*].units[*].unitFact.autocompleteSelectedTaxonID';
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  constructor() { }

  ngOnInit() {
  }

  onTaxonSelect(value, to) {
    const mapping = {...this.mapping};

    if (to === VALUE_IGNORE) {
      mapping[value] = to;
    } else if (typeof to !== 'undefined' && typeof to.key !== 'undefined' && to.value) {
      if (this.addTaxonIDTo) {
        const newValue = to.value.toUpperCase() === (value || '').toUpperCase() ? value : to.value;
        mapping[value] = {_merge_: {[this.field.key]: newValue, [this.addTaxonIDTo]: to.key}};
      } else {
        mapping[value] = to;
      }
    }
    this.mappingChanged.emit(mapping);
  }
}
