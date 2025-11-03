import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { PlatformService } from '../../../root/platform.service';
import { AudioNotSupportedErrorComponent } from './audio-not-supported-error.component';
import { AudioIosWarningComponent } from './audio-ios-warning.component';
import { AudioService } from '../service/audio.service';
import { TranslateService } from '@ngx-translate/core';

@Directive({ selector: '[lajiRequiresAudioSupport]' })
export class RequiresAudioSupportDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private platformService: PlatformService,
    private audioService: AudioService,
    private translate: TranslateService
  ) { }

  @Input() set lajiRequiresAudioSupport(sampleRate: number) {
    this.viewContainer.clear();

    const webAudioApiSupported = this.platformService.webAudioApiIsSupported;
    if (webAudioApiSupported && this.audioService.sampleRateIsSupported(sampleRate)) {
      if (this.platformService.isIOS) {
        this.viewContainer.createComponent(AudioIosWarningComponent);
      }
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      const errorMessageKey = !webAudioApiSupported ? 'audioViewer.notSupported' : 'audioViewer.sampleRateNotSupported';
      const errorMessage = this.translate.instant(errorMessageKey, { sampleRate: sampleRate / 1000 });
      const componentRef = this.viewContainer.createComponent(AudioNotSupportedErrorComponent);
      componentRef.instance.errorMsg = errorMessage;
    }
  }
}
