import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, Inject, PLATFORM_ID, EventEmitter, Output } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';
import { Util } from 'projects/laji/src/app/shared/service/util.service';

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
    this.headingChange.emit();
  }
  get heading() { return this._heading; }
  @Input() headerClass: string | undefined;

  @Output() headingChange = new EventEmitter<null>();

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
              @Inject(PLATFORM_ID) private platformId: any,
              private platformService: PlatformService
  ) { }

  triggerResizeEvent(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      Util.dispatchResizeEvent(this.platformService);
    }, 100);
  }
}
