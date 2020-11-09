import { Component } from '@angular/core';

@Component({
  selector: 'laji-bibliography',
  template: `
    <div class="container-fluid">
      <hr>
      <laji-info-page [rootPage]="{'fi': '4535', 'en': '4533', 'sv': '4537'}"></laji-info-page>
    </div>
  `,
})
export class BibliographyComponent {}