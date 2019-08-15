import { Component } from '@angular/core';

@Component({
  selector: 'laji-publications',
  template: `
    <laji-simple-omni></laji-simple-omni>
    <div class="container-fluid">
      <laji-info-page [rootPage]="{'fi': 'r-13', 'en': 'r-15', 'sv': 'r-17'}"></laji-info-page>
    </div>
  `,
})
export class PublicationsComponent {

}
