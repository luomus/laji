import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import 'moment/locale/sv';
import { GlobalStore } from '../shared/store/global.store';

@Component({
  selector: 'laji-locale-sv',
  template: '<router-outlet></router-outlet>'
})
export class LocaleSvComponent extends LocaleComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) protected platformId,
    @Inject(WINDOW) protected window: Window,
    protected translateService: TranslateService,
    protected store: GlobalStore
  ) {
    super();
    moment.locale('sv');
    this.setLocale('sv');
  }

  ngOnInit() {
  }
}
