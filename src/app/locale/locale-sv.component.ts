import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocaleComponent } from './locale.component';
import * as moment from 'moment';
import 'moment/locale/sv';
import { WindowRef } from '../shared/windows-ref';

@Component({
  selector: 'laji-locale-sv',
  template: '<router-outlet></router-outlet>'
})
export class LocaleSvComponent extends LocaleComponent implements OnInit {

  constructor(protected translateService: TranslateService, protected windowRef: WindowRef) {
    super();
  }

  ngOnInit() {
    moment.locale('sv');
    this.setLocale('sv');
  }
}
