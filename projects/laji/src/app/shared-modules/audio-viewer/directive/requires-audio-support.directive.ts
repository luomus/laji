import { ComponentFactoryResolver, Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';
import { PlatformService } from '../../../root/platform.service';
import { AudioNotSupportedErrorComponent } from './audio-not-supported-error.component';
import { AudioIosWarningComponent } from './audio-ios-warning.component';
import { AudioService } from '../service/audio.service';

@Directive({ selector: '[lajiRequiresAudioSupport]' })
export class RequiresAudioSupportDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    private platformService: PlatformService,
    private audioService: AudioService
  ) { }

  @Input() set lajiRequiresAudioSupport(sampleRate: number) {
    if (!this.platformService.webAudioApiIsSupported) {
      const factory = this.resolver.resolveComponentFactory(AudioNotSupportedErrorComponent);
      this.viewContainer.createComponent(factory);
    } else {
      this.audioService.setDefaultSampleRate(sampleRate);
      if (this.platformService.isIOS) {
        const factory = this.resolver.resolveComponentFactory(AudioIosWarningComponent);
        this.viewContainer.createComponent(factory);
      }
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
