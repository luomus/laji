import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';

@Component({
  selector: 'es-app',
  template: `
  <es-gesture-grid></es-gesture-grid>
  `,
  styleUrls: [
    './app.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
}
