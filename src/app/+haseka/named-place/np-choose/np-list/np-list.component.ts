import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NamedPlace } from '../../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-list',
  templateUrl: './np-list.component.html',
  styleUrls: ['./np-list.component.css']
})
export class NpListComponent {

  @Input() namedPlaces: NamedPlace[];
  @Output() onActivePlaceChange = new EventEmitter<number>();

  @Input() activeNP: number;

  constructor() { }

  changeActivePlace(idx) {
    this.onActivePlaceChange.emit(idx);
  }
}
