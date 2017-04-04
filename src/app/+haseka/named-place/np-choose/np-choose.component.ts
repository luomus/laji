import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NamedPlace } from '../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-choose',
  templateUrl: './np-choose.component.html',
  styleUrls: ['./np-choose.component.css']
})
export class NpChooseComponent {
  active = 'map';

  @Input() formInfo: any;
  @Input() namedPlaces: NamedPlace[];
  @Input() visible = true;

  @Output() onActivePlaceChange = new EventEmitter<number>();
  @Output() onCreateButtonClick = new EventEmitter();

  activeNP = -1;

  constructor() {}

  setActive(newActive: string) {
    this.active = newActive;
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    this.onActivePlaceChange.emit(idx);
  }

  createButtonClick() {
    this.onCreateButtonClick.emit();
  }
}
