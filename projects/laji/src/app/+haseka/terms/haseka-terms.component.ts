import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-haseka-terms',
  templateUrl: './haseka-terms.component.html',
  styleUrls: ['./haseka-terms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HasekaTermsComponent implements OnInit, AfterViewInit {

  @LocalStorage() public vihkoSettings;

  @Input() modal = false;
  @Input() dismissLabel = 'Ok';

  modalIsVisible = false;

  ngOnInit() {
    if (!this.vihkoSettings) {
      this.vihkoSettings = { showIntro: true };
    }
  }

  ngAfterViewInit() {
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
  }

}
