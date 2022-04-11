import { ComponentFactoryResolver, Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PlatformService } from '../../../root/platform.service';
import { AudioNotSupportedErrorComponent } from './audio-not-supported-error.component';
import { AudioIosWarningComponent } from './audio-ios-warning.component';

@Directive({ selector: '[lajiRequiresAudioSupport]' })
export class RequiresAudioSupportDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    private platformService: PlatformService,
  ) { }

  ngOnInit() {
    if (!this.platformService.webAudioApiIsSupported) {
      const factory = this.resolver.resolveComponentFactory(AudioNotSupportedErrorComponent);
      this.viewContainer.createComponent(factory);
    } else {
      if (this.platformService.isIOS) {
        const factory = this.resolver.resolveComponentFactory(AudioIosWarningComponent);
        this.viewContainer.createComponent(factory);
      }
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
