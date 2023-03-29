import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-audio-not-supported-error',
  template: '<alert type="danger" [dismissible]="false" *lajiBrowserOnly>{{ errorMsg }}</alert>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioNotSupportedErrorComponent {
  @Input() errorMsg = 'Not supported';
}
