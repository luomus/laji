import { Component } from '@angular/core';

@Component({
  selector: 'laji-kerttu-closed',
  template: `
    <div class="container laji-page" style="padding: 20px 40px">
      <laji-info-page [page]="{'fi': '6794', 'en': '6796', 'sv': '6796'} | multiLang"></laji-info-page>
    </div>
  `
})
export class KerttuClosedComponent {}
