import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormField, IGNORE_VALUE} from '../../../model/form-field';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'laji-special-taxon-id',
  templateUrl: './special-taxon-id.component.html',
  styleUrls: ['./special-taxon-id.component.css']
})
export class SpecialTaxonIdComponent implements OnInit {

  @Input() invalidValues: string[];
  @Input() mapping: {[value: string]: any} = {};
  @Input() field: FormField;
  @Output() mappingChanged = new EventEmitter<{[value: string]: string}>();

  dataSource: Observable<any>;
  limit = 20;
  taxon: {[key: string]: string} = {};

  constructor() {}

  ngOnInit() {
  }

  onTaxonSelect(value, to) {
    const mapping = {...this.mapping};

    if (to === IGNORE_VALUE) {
      mapping[value] = to;
    } else if (typeof to !== 'undefined' && to.key) {
      mapping[value] = to.key;
    }
    this.mappingChanged.emit(mapping);
  }

}
