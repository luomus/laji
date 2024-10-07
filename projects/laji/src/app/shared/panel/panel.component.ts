/* eslint-disable @angular-eslint/component-selector */
import { Inject, PLATFORM_ID, AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnChanges, Output, TemplateRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: '[laji-panel]',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  animations: [
    trigger('visibilityState', [
      state('in' , style({ height: '*' })),
      state('out', style({ height: 0 })),
      transition('in <=> out', animate('100ms'))
    ])
  ]
})
export class PanelComponent implements AfterViewInit {
  @Input() title?: string;
  @Input() headingTemplate?: TemplateRef<any>;
  @Input() index?: number;
  @Input() open = false;
  @Input() autoToggle = false;
  @Input() headerLink = true;
  @Output() activate = new EventEmitter();
  public hideInside = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: number,
  ) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // This hack force triggers angular animation state transition.
    // For some reason hydration+animations don't play together well
    // and the animation system thinks that the state transition was already executed
    // by the time we load in
    const open = this.open;
    this.open = false;
    setTimeout(() => {
      this.open = open;
    });
  }

  activateCurrent() {
    if (this.autoToggle) {
      this.open = !this.open;
    }
    this.activate.emit({
      value: this.index,
      open: this.open
    });
  }

  animationStart(event: any) {
    if (event.toState === 'out') {
      this.hideInside = true;
    }
  }

  animationDone(event: any) {
    if (event.toState === 'in') {
      this.hideInside = false;
    }

    // Another hack related to hydration+animations not working together.
    // SSR outputs the following html:
    // <div ... role="tabpanel" aria-labelledby class="panel-collapse ... ng-trigger ng-trigger-visibilityState" style="height: *;">
    // but `height: *` is not valid html, which is probably causing issues.
    // Here we are sending a resize event when height has an actual sensible value which allows the children heights to be recalculated:
    if (isPlatformBrowser(this.platformId)) {
      window.dispatchEvent(new Event('resize'));
    }
  }
}
