import { Component } from '@angular/core';

@Component({
  selector: 'bsg-identification-instructions',
  template: `
    <laji-info-page [page]="{'en': '6576', 'es': '7755'} | multiLang"></laji-info-page>
  `
})
export class IdentificationInstructionsComponent {}
