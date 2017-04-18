import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { LocalStorage } from 'ng2-webstorage';
import { Router } from '@angular/router';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css']
})
export class HasekaComponent implements OnInit {

  @LocalStorage() public vihkoSettings;
  public email: string;

  public activeTab = 'forms';

  constructor(
    public userService: UserService,
    public router: Router
  ) {
  }

  ngOnInit() {
    if (!this.vihkoSettings) {
      this.vihkoSettings = { showIntro: true };
    }
  }

  toggleInfo() {
    this.vihkoSettings = {showIntro: !this.vihkoSettings.showIntro};
  }

  changeTab(tab: string) {
    this.activeTab = tab;
  }
}
