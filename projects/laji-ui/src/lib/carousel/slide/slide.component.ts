import { ChangeDetectionStrategy, Component, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'lu-slide',
  template: `<ng-content></ng-content>`,
  styleUrls: ['./slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideComponent {
  active = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  setActiveState(b: boolean) {
    this.renderer.setStyle(this.el.nativeElement, 'display', b ? 'block' : 'none');
  }
}
