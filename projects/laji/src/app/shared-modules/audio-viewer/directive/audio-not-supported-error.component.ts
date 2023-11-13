import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'laji-audio-not-supported-error',
  template: '<lu-alert type="danger" [dismissible]="false" *lajiBrowserOnly>{{ "audioViewer.notSupported" | translate }}</lu-alert>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioNotSupportedErrorComponent {

}
