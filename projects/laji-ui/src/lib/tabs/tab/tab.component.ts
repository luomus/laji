import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, Inject, PLATFORM_ID, EventEmitter, Output } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WINDOW } from '@ng-toolkit/universal';

@Component({
  selector: 'lu-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabComponent {
  private _heading = '';
  @Input() set heading(h) {
    this._heading = h;
    this.inputChange.emit();
  }
  get heading() { return this._heading; }

  @Output() inputChange = new EventEmitter<null>();

  _active = false;
  set active(a) {
    this._active = a;
    this.cdr.markForCheck();
    this.triggerResizeEvent();
  }
  get active() {
    return this._active;
  }

  constructor(
              private cdr: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object,
              @Inject(WINDOW) private window: Window
  ) { }

  triggerResizeEvent(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      try {
        this.window.dispatchEvent(new Event('resize'));
      } catch (e) {
        try {
          const evt = this.window.document.createEvent('UIEvents');
          evt.initUIEvent('resize', true, false, this.window, 0);
          this.window.dispatchEvent(evt);
        } catch (e) {}
      }
    }, 100);
  }
}
