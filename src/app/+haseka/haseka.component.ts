import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';
import { LocalStorage } from 'ng2-webstorage';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css']
})
export class HasekaComponent implements OnInit {

  @LocalStorage() public vihkoSettings;
  public email: string;

  constructor(
    public userService: UserService
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
}
