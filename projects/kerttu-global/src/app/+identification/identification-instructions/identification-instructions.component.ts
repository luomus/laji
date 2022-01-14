import { Component } from '@angular/core';

@Component({
  selector: 'bsg-identification-instructions',
  template: `
    <div class="container laji-page">
      <h2>Instructions</h2>
      <laji-info-page [page]="{'en': ''} | multiLang"></laji-info-page>
    </div>
  `
})
export class IdentificationInstructionsComponent {}
