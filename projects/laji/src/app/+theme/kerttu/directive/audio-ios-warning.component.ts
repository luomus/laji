import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'laji-audio-not-supported-error',
  template: '<alert type="warning" [dismissible]="true"><span [innerHTML]="\'theme.kerttu.iosWarning\' | translate"></span></alert>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioIosWarningComponent {

}
