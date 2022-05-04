import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'laji-audio-sample-rate-warning',
  template: '<alert type="warning" [dismissible]="true"><span [innerHTML]="\'theme.kerttu.sampleRateWarning\' | translate"></span></alert>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioSampleRateWarningComponent {

}
