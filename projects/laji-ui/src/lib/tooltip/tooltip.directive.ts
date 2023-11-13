import { AfterViewInit, ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2, ViewContainerRef, Inject } from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { DOCUMENT } from '@angular/common';
import { PopoverPlacement, positionPopoverInBody } from '../popover/popover.directive';

@Directive({
  selector: '[luTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input() luTooltip: string;
  @Input() placement: PopoverPlacement = 'top';
  @Input() isDisabled = false; // note this is unnecessary, but required for ngx-bootstrap compat

  private compRef: ComponentRef<TooltipComponent> | undefined;

  constructor(
    private el: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  @HostListener('mouseenter')
  load() {
    if (this.compRef || !this.luTooltip || this.isDisabled) {
      return;
    }
    this.compRef = this.viewContainerRef.createComponent(TooltipComponent);
    this.compRef.instance.content = this.luTooltip;

    positionPopoverInBody(
      this.compRef.location.nativeElement, this.el.nativeElement,
      this.document, this.renderer, this.placement
    );
  }

  @HostListener('mouseleave')
  unload() {
    if (!this.compRef) { return; }
    this.compRef.destroy();
    this.compRef = undefined;
  }

  ngOnDestroy(): void {
    this.unload();
  }
}
