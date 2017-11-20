import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import 'moment/locale/fi';
import { WindowRef } from '../shared/windows-ref';

@Component({
  selector: 'laji-locale-fi',
  template: '<router-outlet></router-outlet>'
})
export class LocaleFiComponent extends LocaleComponent implements OnInit {

  constructor(protected translateService: TranslateService, protected windowRef: WindowRef) {
    super();
    moment.locale('fi');
    this.setLocale('fi');
  }

  ngOnInit() {
  }
}
