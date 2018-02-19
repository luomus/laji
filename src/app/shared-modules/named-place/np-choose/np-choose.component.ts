import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { WindowRef } from '../../../shared/windows-ref';

@Component({
  selector: 'laji-np-choose',
  templateUrl: './np-choose.component.html',
  styleUrls: ['./np-choose.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NpChooseComponent implements OnInit, OnChanges {
  active = 'list';
  height = '600px';
  mapIsActivated = false;

  @Input() formData: any;
  @Input() namedPlaces: NamedPlace[] = [];
  @Input() visible = true;
  @Input() allowCreate = false;
  @Input() userID: string;

  @Output() onActivePlaceChange = new EventEmitter<number>();
  @Output() onCreateButtonClick = new EventEmitter();

  activeNP = -1;

  constructor(
    private window: WindowRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.updateHeight();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData']) {
      if (this.formData && this.formData.namedPlaceOptions && this.formData.namedPlaceOptions.startWithMap) {
        this.active = 'map';
        this.mapIsActivated = true;
      } else {
        this.active = 'list';
      }
    }
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
      this.formData.namedPlaceOptions.hideMapTab === true
    );
  }
}
