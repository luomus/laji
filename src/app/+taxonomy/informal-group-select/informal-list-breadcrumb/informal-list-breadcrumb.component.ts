import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InformalTaxonGroup } from '../../../shared/model/InformalTaxonGroup';

@Component({
  selector: 'laji-informal-list-breadcrumb',
  templateUrl: './informal-list-breadcrumb.component.html',
  styleUrls: ['./informal-list-breadcrumb.component.css']
})

export class InformalListBreadcrumbComponent {

  @Input() informalGroup: InformalTaxonGroup;
  @Input() groups: Array<InformalTaxonGroup>;
  @Input() compact = false;

  @Output() onInformalGroupSelect = new EventEmitter<string>();

}
