import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import 'moment/locale/fi';
import { GlobalStore } from '../shared/store/global.store';

@Component({
  selector: 'laji-locale-fi',
  template: '<router-outlet></router-outlet>'
})
export class LocaleFiComponent extends LocaleComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) protected platformId,
    @Inject(WINDOW) protected window: Window,
    protected translateService: TranslateService,
    protected store: GlobalStore
  ) {
    super();
    moment.locale('fi');
    this.setLocale('fi');
  }

  ngOnInit() {
  }
}
