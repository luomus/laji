import { Component, OnInit, ChangeDetectionStrategy, Inject, PLATFORM_ID } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-beta-popup',
  template: `
  <div class="laji-beta-popup" *ngIf="open">
    <div class="d-flex justify-between">
      <p translate>betapopup.desc</p>
      <lu-button-round (click)="close()" role="neutral">
        <lu-icon type="close"></lu-icon>
      </lu-button-round>
    </div>
  </div>
`,
  styleUrls: ['./beta-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BetaPopupComponent implements OnInit {
  @LocalStorage('betapopup', true) betaPopup;
  open = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && this.betaPopup) {
      this.open = true;
    }
  }

  close() {
    this.open = false;
    this.betaPopup = this.open;
  }
}
