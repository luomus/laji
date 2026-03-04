import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'bsg-bat-identification',
    template: `
      <div class="container-fluid laji-page">
        <router-outlet></router-outlet>
      </div>
  `,
    styles: [`
      :host {
        display: flex;
        flex: 1 0 auto;
        width: 100%;
      }
      .laji-page {
        width: 100%;
      }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class XenoCantoIdentificationComponent {

}
