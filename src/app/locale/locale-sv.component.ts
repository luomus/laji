import { WINDOW } from '@ng-toolkit/universal';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import 'moment/locale/sv';

@Component({
  selector: 'laji-locale-sv',
  template: '<router-outlet></router-outlet>'
})
export class LocaleSvComponent extends LocaleComponent {

  constructor(
    @Inject(PLATFORM_ID) protected platformId,
    @Inject(WINDOW) protected window: Window,
    protected translateService: TranslateService
  ) {
    super();
    moment.locale('sv');
    this.setLocale('sv');
  }

}
