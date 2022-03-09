import { Component } from '@angular/core';

@Component({
  selector: 'bsg-validation-instructions',
  template: `    
    <laji-info-page [page]="{'en': '6573'} | multiLang"></laji-info-page>
  `
})
export class ValidationInstructionsComponent {}
