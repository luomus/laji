import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'es-app',
  template: `
  <es-slideshow></es-slideshow>
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
