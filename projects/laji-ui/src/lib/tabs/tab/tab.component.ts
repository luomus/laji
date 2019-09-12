import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'lu-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {
  @Input() heading: string;
  _active = false;
  set active(a) {
    this._active = a;
    this.cdr.markForCheck();
  }
  get active() {
    return this._active;
  }

  constructor(private cdr: ChangeDetectorRef) { }
}
