import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AppComponent } from '../../../../src/app/shared-modules/app-component/app.component';

@Component({
  selector: 'vir-app',
  template: `
    <vir-nav-bar></vir-nav-bar>
    <vir-global-message></vir-global-message>
    <div class="router-content">
      <router-outlet></router-outlet>
    </div>
    <laji-feedback [iconOnly]="true"></laji-feedback>
    <laji-viewer-modal></laji-viewer-modal>
  `,
  styleUrls: ['../../../../src/app/shared-modules/app-component/app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirAppComponent extends AppComponent {

}
