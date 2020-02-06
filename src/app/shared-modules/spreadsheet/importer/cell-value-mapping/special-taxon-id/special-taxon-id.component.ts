import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { IFormField, VALUE_IGNORE } from '../../../model/excel';

@Component({
  selector: 'laji-special-taxon-id',
  templateUrl: './special-taxon-id.component.html',
  styleUrls: ['./special-taxon-id.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecialTaxonIdComponent {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: IFormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  dataSource: Observable<any>;
  limit = 20;
  taxon: {[key: string]: string} = {};

  onTaxonSelect(value, to) {
    const mapping = {...this.mapping};

    if (to === VALUE_IGNORE) {
      mapping[value] = to;
    } else if (typeof to !== 'undefined' && typeof to.key !== 'undefined') {
      mapping[value] = to.key;
    }
    this.mappingChanged.emit(mapping);
  }

}
