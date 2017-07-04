import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import { WindowRef } from '../shared/windows-ref';

@Component({
  selector: 'laji-locale-en',
  template: '<router-outlet></router-outlet>'
})
export class LocaleEnComponent extends LocaleComponent implements OnInit {

  constructor(protected translateService: TranslateService, protected windowRef: WindowRef) {
    super();
  }

  ngOnInit() {
    moment.locale('en');
    this.setLocale('en');
  }
}
