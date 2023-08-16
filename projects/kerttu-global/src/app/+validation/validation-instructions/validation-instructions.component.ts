import { Component } from '@angular/core';

@Component({
  selector: 'bsg-validation-instructions',
  template: `
    <laji-info-page [page]="{'en': '6573', 'es': '7757', 'fr': '7791'} | multiLang"></laji-info-page>
  `
})
export class ValidationInstructionsComponent {}
