import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NamedPlace } from '../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-choose',
  templateUrl: './np-choose.component.html',
  styleUrls: ['./np-choose.component.css']
})
export class NpChooseComponent {
  active = 'list';
  mapActivated = false;

  @Input() namedPlaces: NamedPlace[];
  activeNP = -1;
  @Output() onActivePlaceChange = new EventEmitter<number>();

  constructor() {}

  setActive(newActive: string) {
    this.active = newActive;
    if (!this.mapActivated && newActive === 'map') {
      this.mapActivated = true;
    }
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    this.onActivePlaceChange.emit(idx);
  }
}
