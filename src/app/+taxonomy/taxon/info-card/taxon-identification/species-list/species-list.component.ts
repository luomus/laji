import { ChangeDetectionStrategy, Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { Taxonomy } from 'src/app/shared/model/Taxonomy';

const SCROLL_SPEED = 500; // pixels per second

@Component({
  selector: 'laji-identification-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationSpeciesListComponent {
  @Input() speciesList: Taxonomy[];

  @ViewChild('speciesContainer') speciesContainer: ElementRef;

  previousScrollTimestamp: DOMHighResTimeStamp;
  scrolling = false;
  scrollDirection = 1;

  destroyMouseupListener: () => void;

  constructor(private renderer: Renderer2) {}

  scroll(timestamp: DOMHighResTimeStamp) {
    if (!this.scrolling) {
      return;
    }
    let deltaTime = 16; // assuming that first frame was 16ms
    if (this.previousScrollTimestamp) {
      deltaTime = timestamp - this.previousScrollTimestamp;
    }
    this.previousScrollTimestamp = timestamp;
    this.speciesContainer.nativeElement.scrollLeft += deltaTime * (SCROLL_SPEED / 1000) * this.scrollDirection;
    window.requestAnimationFrame(this.scroll.bind(this));
  }

  scrollStart(scrollDirection: number) {
    this.scrollDirection = scrollDirection;
    this.destroyMouseupListener = this.renderer.listen(window, 'mouseup', this.scrollEnd.bind(this));
    this.scrolling = true;
    this.previousScrollTimestamp = undefined;
    window.requestAnimationFrame(this.scroll.bind(this));
  }

  scrollEnd() {
    this.scrolling = false;
    this.destroyMouseupListener();
  }

  ngOnDestroy() {
    if (this.destroyMouseupListener) {
      this.destroyMouseupListener();
    }
  }
}
