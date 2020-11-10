import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[lajiFixedBelow]'
})
export class FixedBelowDirective {

  @Input() set lajiFixedBelow(parent: Element) {
    const viewportOffset = parent.getBoundingClientRect();
    this.renderer.setStyle(this.el.nativeElement, 'top', viewportOffset.bottom + 'px');
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

}
