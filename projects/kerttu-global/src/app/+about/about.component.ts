import { Component } from '@angular/core';

@Component({
  selector: 'laji-about',
  template: `
    <div class="container laji-page">
      <laji-info-page [page]="{'fi': '5802', 'en': '5802', 'sv': '5802'} | multiLang"></laji-info-page>
    </div>
  `
})
export class AboutComponent {}
