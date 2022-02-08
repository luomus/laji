import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ba-app',
  template: `
    <ba-navbar></ba-navbar>
    <div class="main-view">
      <router-outlet></router-outlet>
    </div>
    <ba-footer></ba-footer>
  `,
  styleUrls: [
    './app.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(translate: TranslateService) {
    translate.setDefaultLang('fi');
    translate.use('fi');
  }
}
