import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ISlideData } from '../slide/slide.component';

@Component({
  selector: 'es-slide-navigation',
  templateUrl: 'slide-navigation.component.html',
  styleUrls: ['slide-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideNavigationComponent {
  @Input() slides: ISlideData[];
  @Input() currentSlideIdx: number;

  @Output() selectSlide = new EventEmitter<number>();

  onSelectSlide(index: number) {
    if (index === this.currentSlideIdx) { return; }
    this.selectSlide.emit(index);
  }

  trackByFn(idx: number, slide: ISlideData) {
    return slide.title;
  }
}
