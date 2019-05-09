import { Component, OnInit } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-haseka-terms',
  templateUrl: './haseka-terms.component.html',
  styleUrls: ['./haseka-terms.component.scss']
})
export class HasekaTermsComponent implements OnInit {

  @LocalStorage() public vihkoSettings;

  constructor() { }

  ngOnInit() {
    if (!this.vihkoSettings) {
      this.vihkoSettings = { showIntro: true };
    }
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
  }

}
