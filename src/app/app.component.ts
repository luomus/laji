import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { LocalStorageService } from "angular2-localstorage/LocalStorageEmitter";
import { LocalStorage } from "angular2-localstorage/WebStorage";

import { NavbarComponent, FooterComponent, WarehouseApi, TaxonomyApi, NewsApi } from './shared';

@Component({
  selector: 'laji-app',
  pipes: [],
  providers: [LocalStorageService, WarehouseApi, TaxonomyApi, NewsApi],
  directives: [ ROUTER_DIRECTIVES, NavbarComponent, FooterComponent ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @LocalStorage() public defaultLang = 'fi';

  constructor(public translate: TranslateService, private storageService: LocalStorageService) {
    translate.use(this.defaultLang);
    this.translate.onLangChange.subscribe(
      lang => this.defaultLang = this.translate.currentLang
    );
  }
}
