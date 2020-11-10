import { Component } from '@angular/core';

@Component({
  selector: 'laji-pinkka',
  template: `
    <div class="container-fluid">
      <hr>
      <laji-info-page [rootPage]="{'fi': '2239', 'en': '3628', 'sv': '3630'}"></laji-info-page>
    </div>
  `,
})
export class PinkkaComponent {

}
