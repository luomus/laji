import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'laji-audio-ios-warning',
  template: '<alert type="warning" [dismissible]="true"><span [innerHTML]="\'theme.kerttu.iosWarning\' | translate"></span></alert>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioIosWarningComponent {

}
