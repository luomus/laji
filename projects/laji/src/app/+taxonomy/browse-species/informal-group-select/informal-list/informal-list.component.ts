import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InformalTaxonGroup } from '../../../../shared/model/InformalTaxonGroup';

@Component({
  selector: 'laji-informal-list',
  templateUrl: './informal-list.component.html',
  styleUrls: ['./informal-list.component.scss'],

})
export class InformalListComponent {
  @Input() informalTaxonGroups: InformalTaxonGroup[];
  @Input() showAll = false;
  @Output() informalGroupSelect = new EventEmitter<string>();
}
