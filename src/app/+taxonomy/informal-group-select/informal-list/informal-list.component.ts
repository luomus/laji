import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PagedResult } from '../../../shared/model/PagedResult';
import { InformalTaxonGroup } from '../../../shared/model/InformalTaxonGroup';

@Component({
  selector: 'laji-informal-list',
  templateUrl: './informal-list.component.html',
  styleUrls: ['./informal-list.component.css'],

})
export class InformalListComponent {

  @Input() tree: PagedResult<InformalTaxonGroup>;
  @Input() compact = false;
  @Input() showAll = false;
  @Output() onInformalGroupSelect = new EventEmitter<string>();

}
