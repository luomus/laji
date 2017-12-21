import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { WindowRef } from '../../../shared/windows-ref';

@Component({
  selector: 'laji-np-choose',
  templateUrl: './np-choose.component.html',
  styleUrls: ['./np-choose.component.css']
})
export class NpChooseComponent implements OnInit {
  active = 'list';
  height = '600px';
  mapIsActivated = false;

  @Input() formData: any;
  @Input() namedPlaces: NamedPlace[] = [];
  @Input() visible = true;
  @Input() allowCreate = false;

  @Output() onActivePlaceChange = new EventEmitter<number>();
  @Output() onCreateButtonClick = new EventEmitter();

  activeNP = -1;

  constructor( private window: WindowRef) {}

  ngOnInit() {
    this.updateHeight();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateHeight();
  }

  updateHeight() {
    this.height = Math.min(this.window.nativeWindow.innerHeight - 70, 490) + 'px';
  }

  setActive(newActive: string) {
    this.active = newActive;
    if (newActive === 'map') {
      this.mapIsActivated = true;
    }
  }

  setActiveNP(idx: number) {
    this.activeNP = idx;
    this.onActivePlaceChange.emit(idx);
  }

  createButtonClick() {
    this.onCreateButtonClick.emit();
  }

  showMap() {
    return !(
      this.formData &&
      this.formData.namedPlaceOptions &&
      this.formData.namedPlaceOptions.hideMapTab &&
      this.formData.namedPlaceOptions.hideMapTab === 'true'
    );
  }
}
