import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChildren, QueryList } from '@angular/core';
import { SlideComponent } from './slide/slide.component';

@Component({
  selector: 'lu-carousel',
  template: `<ng-content></ng-content>
             <button (click)="onSpinLeft()" id="left"></button>
             <button (click)="onSpinRight()" id="right"></button>`,
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements AfterViewInit {
  @ContentChildren(SlideComponent) slides!: QueryList<SlideComponent>;

  private currentSlideIdx = 0;

  ngAfterViewInit(): void {
    this.updateSlides();
  }

  onSpinRight() {
    this.currentSlideIdx = this.currentSlideIdx === this.slides.length - 1 ? 0 : this.currentSlideIdx + 1;
    this.updateSlides();
  }

  onSpinLeft() {
    this.currentSlideIdx = this.currentSlideIdx === 0 ? this.slides.length - 1 : this.currentSlideIdx - 1;
    this.updateSlides();
  }

  private updateSlides() {
    this.slides.forEach((slide, idx) => {
      slide.setActiveState(idx === this.currentSlideIdx);
    });
  }
}
