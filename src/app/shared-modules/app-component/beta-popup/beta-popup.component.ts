import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';

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

  constructor() {}

  ngOnInit() {
    console.log(JSON.stringify(this.betaPopup));
    if (this.betaPopup) {
      this.open = true;
    }
  }

  close() {
    this.open = false;
    this.betaPopup = this.open;
  }
}
