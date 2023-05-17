import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import {
  BreakpointObserver,
  BreakpointState
} from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { PlatformService } from '../../root/platform.service';

type Breakpoint = 'xs'|'sm'|'md'|'lg';
const breakpoints = {
  lg: 1200,
  md: 992,
  sm: 768,
  xs: 576
};

@Directive({
  selector: '[lajiIfWidthAboveBreakpoint]',
})
export class IfWidthAboveBreakpointDirective implements OnDestroy {
  @Input()
  set lajiIfWidthAboveBreakpoint(breakpoint: Breakpoint) {
    this.breakpoint = breakpoint;
    this.matchesBreakpoint = undefined;
    this.initBreakPointSubscription();
  }

  @Input()
  set lajiIfWidthAboveBreakpointElse(template: TemplateRef<any>) {
    this.elseTemplate = template;
    if (this.breakpoint && this.matchesBreakpoint === false) {
      this.view.clear();
      this.view.createEmbeddedView(this.elseTemplate);
    }
  }

  private breakpoint?: Breakpoint;
  private matchesBreakpoint?: boolean;
  private elseTemplate?: TemplateRef<any>;
  private breakpointSubscription?: Subscription;

  constructor(
    private view: ViewContainerRef,
    private template: TemplateRef<any>,
    private breakpointObserver: BreakpointObserver,
    private platformService: PlatformService
  ) {}

  ngOnDestroy() {
    this.breakpointSubscription?.unsubscribe();
  }

  private initBreakPointSubscription() {
    this.breakpointSubscription?.unsubscribe();
    if (!this.breakpoint || this.platformService.isServer) {
      return;
    }

    this.breakpointSubscription = this.breakpointObserver
      .observe([`(min-width: ${breakpoints[this.breakpoint]}px)`])
      .subscribe((state: BreakpointState) => {
        this.matchesBreakpoint = state.matches;

        this.view.clear();
        if (this.matchesBreakpoint) {
          this.view.createEmbeddedView(this.template);
        } else if (this.elseTemplate) {
          this.view.createEmbeddedView(this.elseTemplate);
        }
      });
  }
}
