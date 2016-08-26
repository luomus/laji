import { Component } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { DROPDOWN_DIRECTIVES } from 'ng2-bootstrap/components/dropdown';

@Component({
  selector:'laji-lang-select',
  templateUrl: 'lang-select.component.html',
  styleUrls: ['./lang-select.component.css'],
  directives: [DROPDOWN_DIRECTIVES]
})
export class LangSelectComponent {
  constructor(public translate: TranslateService) {}
}
