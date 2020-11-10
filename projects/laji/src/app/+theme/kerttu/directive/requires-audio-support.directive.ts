import {ComponentFactoryResolver, Directive, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {PlatformService} from '../../../shared/service/platform.service';
import {AudioService} from '../service/audio.service';
import {AudioNotSupportedErrorComponent} from './audio-not-supported-error.component';

@Directive({ selector: '[lajiRequiresAudioSupport]' })
export class RequiresAudioSupportDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    private platformService: PlatformService,
    private audioService: AudioService,
  ) { }

  ngOnInit() {
    if (this.platformService.isBrowser && !this.webAudioApiIsSupported()) {
      const factory = this.resolver.resolveComponentFactory(AudioNotSupportedErrorComponent);
      this.viewContainer.createComponent(factory);
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private webAudioApiIsSupported() {
    return !!this.audioService.audioContext;
  }
}
