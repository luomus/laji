import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';

@Component({
  selector: 'laji-locale-en',
  template: '<router-outlet></router-outlet>'
})
export class LocaleEnComponent extends LocaleComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) protected platformId, @Inject(WINDOW) protected window: Window, protected translateService: TranslateService) {
    super();
    moment.locale('en');
    this.setLocale('en');
  }

  ngOnInit() {
  }
}
