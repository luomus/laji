import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';

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
}
