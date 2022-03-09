import { Component } from '@angular/core';

@Component({
  selector: 'bsg-identification-instructions',
  template: `
    <div class="container laji-page">
      <laji-info-page [page]="{'en': '6576'} | multiLang"></laji-info-page>
    </div>
  `
})
export class IdentificationInstructionsComponent {}
