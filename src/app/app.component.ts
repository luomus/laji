import { Component, ViewContainerRef } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import {LocalStorageService, LocalStorage} from "angular2-localstorage/dist";

import {
  TaxonomyApi,
  CollectionApi
} from './shared';

@Component({
  selector: 'laji-app',
  providers: [
    TaxonomyApi,
    CollectionApi
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @LocalStorage() public defaultLang = 'fi';

  public viewContainerRef:ViewContainerRef;

  constructor(
    private translate: TranslateService,
    private storageService: LocalStorageService,
    viewContainerRef:ViewContainerRef
  ) {
    translate.use(this.defaultLang);
    this.translate.onLangChange.subscribe(
      lang => this.defaultLang = this.translate.currentLang
    );
    this.viewContainerRef = viewContainerRef;
  }
}
