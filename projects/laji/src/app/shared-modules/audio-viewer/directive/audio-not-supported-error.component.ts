import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-audio-not-supported-error',
  template: '<lu-alert type="danger" [dismissible]="false" *lajiBrowserOnly>{{ errorMsg }}</lu-alert>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioNotSupportedErrorComponent {
  @Input() errorMsg = 'Not supported';
}
