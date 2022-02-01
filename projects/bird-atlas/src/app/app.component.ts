import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ba-app',
  template: `
    <p translate>hello-translate</p>
    <router-outlet></router-outlet>
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
