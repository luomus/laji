import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PagedResult } from '../../../../shared/model/PagedResult';
import { InformalTaxonGroup } from '../../../../shared/model/InformalTaxonGroup';

@Component({
  selector: 'laji-informal-list',
  templateUrl: './informal-list.component.html',
  styleUrls: ['./informal-list.component.scss'],

})
export class InformalListComponent {

  @Input() tree: { results: InformalTaxonGroup[]};
  @Input() showAll = false;
  @Output() informalGroupSelect = new EventEmitter<string>();

}
