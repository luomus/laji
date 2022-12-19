import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'laji-audio-not-supported-error',
  template: '<alert type="danger" [dismissible]="false" *lajiBrowserOnly>{{ "audioViewer.notSupported" | translate }}</alert>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioNotSupportedErrorComponent {

}
