import { Component, Input } from '@angular/core';
import { InformalTaxonGroup } from '../../shared';

@Component({
  selector: 'laji-informal-list',
  templateUrl: 'informal-list.component.html',
  styleUrls: ['informal-list.component.css'],

})
export class InformalListComponent {

  @Input() tree: Array<InformalTaxonGroup>;

}
