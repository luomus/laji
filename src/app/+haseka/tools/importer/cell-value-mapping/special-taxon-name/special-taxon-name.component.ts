import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IFormField, VALUE_IGNORE } from '../../../model/excel';
import { MappingService } from '../../../service/mapping.service';

@Component({
  selector: 'laji-special-taxon-name',
  templateUrl: './special-taxon-name.component.html',
  styleUrls: ['./special-taxon-name.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecialTaxonNameComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: IFormField;
  @Input() addTaxonIDTo = 'gatherings[*].units[*].unitFact.autocompleteSelectedTaxonID';
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  mergeKey = MappingService.mergeKey;
  linkedVisible = true;
  hiddenValues: {[value: string]: boolean} = {};

  constructor() { }

  ngOnInit() {
  }

  toggleLinkedVisible() {
    this.linkedVisible = !this.linkedVisible;
    if (!this.linkedVisible) {
      const hide = {};
      this.invalidValues.forEach(value => {
        if (this.mapping[value]) {
          hide[value] = true;
        }
      });
      this.hiddenValues = hide;
    } else {
      this.hiddenValues = {};
    }
  }

  lajiValue(value) {
    if (
      this.mapping &&
      this.field &&
      this.mapping[value] &&
      this.mapping[value][this.mergeKey] &&
      this.mapping[value][this.mergeKey][this.field.key]
    ) {
      return this.mapping[value][this.mergeKey][this.field.key];
    }
    return '';
  }

  onTaxonSelect(value, to) {
    const mapping = {...this.mapping};

    if (to === VALUE_IGNORE) {
      mapping[value] = to;
    } else if (typeof to !== 'undefined' && typeof to.key !== 'undefined' && to.value) {
      if (this.addTaxonIDTo) {
        const newValue = to.value.toLowerCase() === (value || '').toLowerCase() ? value : to.value;
        mapping[value] = {[this.mergeKey]: {[this.field.key]: newValue, [this.addTaxonIDTo]: to.key}};
      } else {
        mapping[value] = to;
      }
    }
    this.mappingChanged.emit(mapping);
  }
}
