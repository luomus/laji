import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';

@Component({
  selector:'laji-lang-select',
  templateUrl: 'lang-select.component.html',
  styleUrls: ['./lang-select.component.css'],
})
export class LangSelectComponent {
  constructor(public translate: TranslateService) {}
}
