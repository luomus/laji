import { Component } from '@angular/core';

@Component({
  selector: 'bsg-about',
  template: `
    <div class="container laji-page">
      <laji-info-page [page]="{'en': '6570', 'es': '7753'} | multiLang"></laji-info-page>
    </div>
  `
})
export class AboutComponent {}
