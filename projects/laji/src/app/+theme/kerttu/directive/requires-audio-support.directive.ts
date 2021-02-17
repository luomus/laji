import {ComponentFactoryResolver, Directive, Inject, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {PlatformService} from '../../../shared/service/platform.service';
import {AudioService} from '../audio-viewer/service/audio.service';
import {AudioNotSupportedErrorComponent} from './audio-not-supported-error.component';
import {AudioIosWarningComponent} from './audio-ios-warning.component';
import {WINDOW} from '@ng-toolkit/universal';
import {DOCUMENT} from '@angular/common';

@Directive({ selector: '[lajiRequiresAudioSupport]' })
export class RequiresAudioSupportDirective implements OnInit {
  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: Document,
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
      if (this.isIOS()) {
        const factory = this.resolver.resolveComponentFactory(AudioIosWarningComponent);
        this.viewContainer.createComponent(factory);
      }
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private webAudioApiIsSupported() {
    return !!this.audioService.audioContext;
  }

  private isIOS() {
    return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(this.window.navigator.platform)
      // iPad on iOS 13
      || (this.window.navigator.userAgent.includes('MAC') && 'ontouchend' in this.document);
  }
}
