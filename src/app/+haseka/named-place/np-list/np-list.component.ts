import { Component, Input, Output, EventEmitter, OnChanges, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { NamedPlace } from '../../../shared/model/NamedPlace';

@Component({
  selector: 'laji-np-list',
  templateUrl: './np-list.component.html',
  styleUrls: ['./np-list.component.css']
})
export class NpListComponent {

  @Input() namedPlaces: NamedPlace[];
  @Output() onActivePlaceChange = new EventEmitter<NamedPlace>();

  constructor() { }

  changeActivePlace(idx) {
    this.onActivePlaceChange.emit(idx);
  }
}
