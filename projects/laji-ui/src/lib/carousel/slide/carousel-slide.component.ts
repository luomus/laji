import { ChangeDetectionStrategy, Component, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'lu-carousel-slide',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./carousel-slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselSlideComponent {
  active = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  setActiveState(b: boolean) {
    this.renderer.setStyle(this.el.nativeElement, 'display', b ? 'block' : 'none');
  }
}
