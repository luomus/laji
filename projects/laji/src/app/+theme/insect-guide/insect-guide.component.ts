import { Component } from '@angular/core';

@Component({
  selector: 'laji-insect-guide',
  template: `
    <div class="container-fluid">
      <hr>
      <laji-info-page [rootPage]="{'fi': '3566', 'en': '3686', 'sv': '3687'}"></laji-info-page>
    </div>
  `,
})
export class InsectGuideComponent {

}
