import {Component, Input, Output, EventEmitter} from '@angular/core';
import {InformalTaxonGroup} from "../../shared";
import {InformalListItemInterface} from "../informal-list/informal-list-item.model";

@Component({
  selector: 'laji-informal-list-breadcrumb',
  templateUrl: 'informal-list-breadcrumb.component.html',
  styleUrls: [ 'informal-list-breadcrumb.component.css' ]
})

export class InformalListBreadcrumbComponent {
  
  @Input() groups:Array<InformalTaxonGroup>;

}
