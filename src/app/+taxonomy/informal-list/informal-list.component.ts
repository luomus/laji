import {Component, Input, Output, EventEmitter} from '@angular/core';
import {InformalTaxonGroup} from "../../shared";
import {InformalListItemInterface} from "./informal-list-item.model";

@Component({
  selector: 'laji-informal-list',
  templateUrl: 'informal-list.component.html',
  styleUrls: [ 'informal-list.component.css' ],
  
})
export class InformalListComponent {

  @Input() tree:Array<InformalTaxonGroup>;

}
