import { Component } from '@angular/core';

@Component({
  selector: 'bsg-bat-identification-instructions',
  template: `
    <laji-info-page [page]="{'en': '8774', 'es': '8774', 'fr': '8774'} | multiLang"></laji-info-page>
  `
})
export class BatIdentificationInstructionsComponent {}
