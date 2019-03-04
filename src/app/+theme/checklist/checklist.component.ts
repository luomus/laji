import { Component } from '@angular/core';

@Component({
  selector: 'laji-publications',
  template: `
    <div class="container">
      <hr>
      <laji-info-page [rootPage]="{'fi': '2569', 'en': '2584', 'sv': '2578'}"></laji-info-page>
    </div>
  `,
})
export class ChecklistComponent {

}
