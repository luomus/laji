import { Component, ViewContainerRef } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { LocalStorageService } from "angular2-localstorage/LocalStorageEmitter";
import { LocalStorage } from "angular2-localstorage/WebStorage";

import {
  NavbarComponent,
  FooterComponent,
  TaxonomyApi,
  NewsApi,
  CollectionApi
} from './shared';

@Component({
  selector: 'laji-app',
  pipes: [],
  providers: [
    LocalStorageService,
    TaxonomyApi,
    CollectionApi
  ],
  directives: [ ROUTER_DIRECTIVES, NavbarComponent, FooterComponent ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @LocalStorage() public defaultLang = 'fi';

  public viewContainerRef:ViewContainerRef;

  constructor(public translate: TranslateService, private storageService: LocalStorageService, viewContainerRef:ViewContainerRef) {
    translate.use(this.defaultLang);
    this.translate.onLangChange.subscribe(
      lang => this.defaultLang = this.translate.currentLang
    );
    this.viewContainerRef = viewContainerRef;
  }
}
