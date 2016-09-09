import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {InformalTaxonGroup} from "../../shared";
import {InformalListItemInterface} from "./informal-list-item.model";

@Component({
  selector: 'laji-infomal-list',
  templateUrl: 'informal-list.component.html'
})
export class InformalListComponent {

  @Input() tree:InformalTaxonGroup[];
  @Output() onSelect:EventEmitter<InformalTaxonGroup> = new EventEmitter();
  private openChild = false;

  constructor() {
  }

  onChildSelect(group) {
    this.onSelect.emit(group);
  }

  onClick(group:InformalListItemInterface) {
    group.open = !group.open;
    if (group.open || !group.hasSubGroup) {
      this.onSelect.emit(group);
    }
  }

}
