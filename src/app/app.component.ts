import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import {TranslateService, TranslatePipe, TRANSLATE_PROVIDERS} from 'ng2-translate/ng2-translate';

import { NavbarComponent, FooterComponent } from './shared';

@Component({
  selector: 'laji-app',
  pipes: [],
  providers: [],
  directives: [ ROUTER_DIRECTIVES, NavbarComponent, FooterComponent ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public translate: TranslateService) {
    translate.use('fi');
  }
}
