import { ComponentRef, Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2, ViewContainerRef, Inject, ChangeDetectorRef } from '@angular/core';
import { TooltipComponent } from './tooltip.component';
import { DOCUMENT } from '@angular/common';
import { Placement, PlacementService } from '../placement/placement.service';

@Directive({
  selector: '[luTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input() luTooltip?: string;
  @Input() placement: Placement = 'top';
  @Input() isDisabled = false; // note this is unnecessary, but required for ngx-bootstrap compat

  private compRef: ComponentRef<TooltipComponent> | undefined;

  constructor(
    private el: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private placementService: PlacementService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  @HostListener('mouseenter')
  load() {
    if (this.compRef || !this.luTooltip || this.isDisabled) {
      return;
    }
    this.compRef = this.viewContainerRef.createComponent(TooltipComponent);
    this.compRef.instance.content = this.luTooltip;

    this.placementService.attach(
      this.compRef.location.nativeElement, this.el.nativeElement, this.placement,
      { renderer: this.renderer, window, document: this.document }
    );
  }

  @HostListener('mouseleave')
  unload() {
    if (!this.compRef) { return; }
    this.placementService.detach(this.compRef.location.nativeElement);
    this.compRef.destroy();
    this.compRef = undefined;
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.unload();
  }
}
