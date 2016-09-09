import { Component, ViewContainerRef } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

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
  public defaultLang = 'fi';

  public viewContainerRef:ViewContainerRef;

  constructor(public translate: TranslateService, viewContainerRef:ViewContainerRef) {
    translate.use(this.defaultLang);
    this.translate.onLangChange.subscribe(
      lang => this.defaultLang = this.translate.currentLang
    );
    this.viewContainerRef = viewContainerRef;
  }
}
