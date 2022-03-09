import { Component } from '@angular/core';

@Component({
  selector: 'bsg-validation-instructions',
  template: `
    <div class="container laji-page">
      <laji-info-page [page]="{'en': '6573'} | multiLang"></laji-info-page>
    </div>
  `
})
export class ValidationInstructionsComponent {}
