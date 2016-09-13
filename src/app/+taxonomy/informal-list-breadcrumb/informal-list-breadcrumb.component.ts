import {Component, Input, Output, EventEmitter} from '@angular/core';
import {InformalTaxonGroup} from "../../shared";
import {InformalListItemInterface} from "../informal-list/informal-list-item.model";

@Component({
  selector: 'laji-informal-list-breadcrumb',
  templateUrl: 'informal-list-breadcrumb.component.html',
  styleUrls: [ 'informal-list-breadcrumb.component.css' ]
})

export class InformalListBreadcrumbComponent {
  
  constructor() {
  }

  @Input() groups:Array<InformalTaxonGroup>;

  @Output() onSelect:EventEmitter<InformalTaxonGroup> = new EventEmitter();

  onClick(group:InformalListItemInterface) {
    this.onSelect.emit(group);
    return false;
  }

}
