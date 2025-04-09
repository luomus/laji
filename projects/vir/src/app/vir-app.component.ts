import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppComponent } from '../../../laji/src/app/shared-modules/app-component/app.component';

@Component({
  selector: 'vir-app',
  template: `
    <ng-container *lajiLoggedIn="true">
      <vir-nav-bar></vir-nav-bar>
      <vir-global-message></vir-global-message>
    </ng-container>
    <div class="router-content">
      <router-outlet></router-outlet>
    </div>
    <ng-container *lajiLoggedIn="true">
      <vir-footer [onFrontPage]="onFrontPage"></vir-footer>
      <laji-feedback [iconOnly]="true"></laji-feedback>
      <laji-viewer-modal></laji-viewer-modal>
    </ng-container>
  `,
  styleUrls: [
    '../../../laji/src/app/shared-modules/app-component/app.component.scss',
    './vir-app.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VirAppComponent extends AppComponent {}
