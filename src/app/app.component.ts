import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import { LocalStorageService } from "angular2-localstorage/LocalStorageEmitter";
import { LocalStorage } from "angular2-localstorage/WebStorage";

import { NavbarComponent, FooterComponent, WarehouseApi, TaxonomyApi, NewsApi } from './shared';
import {TriplestoreLabelService} from "./shared/service/triplestore-label.service";
import {WarehouseValueMappingService} from "./shared/service/warehouse-value-mapping.service";
import {TriplestorePipe} from "./shared/pipe/triplestore.pipe";
import {MetadataApi} from "./shared/api/MetadataApi";

@Component({
  selector: 'laji-app',
  pipes: [],
  providers: [
    LocalStorageService,
    TaxonomyApi,
    NewsApi
  ],
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
