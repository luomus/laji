import { Component } from '@angular/core';
import { UserService } from '../shared/service/user.service';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';
import { LocalStorage } from 'angular2-localstorage/dist';

@Component({
  selector: 'haseka',
  templateUrl: './haseka.component.html',
  styleUrls: ['./haseka.component.css'],
  providers: [FormApi, DocumentApi]
})
export class HasekaComponent {

  @LocalStorage() public vihkoSettings = {showIntro: true};
  public email: string;

  constructor(
    public userService: UserService
  ) {
  }

  toggleInfo() {
    this.vihkoSettings.showIntro = !this.vihkoSettings.showIntro;
  }
}
