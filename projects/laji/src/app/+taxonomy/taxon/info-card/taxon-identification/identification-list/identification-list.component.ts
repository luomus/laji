import { ChangeDetectionStrategy, Component, Input,
ElementRef, ViewChild, Renderer2, ComponentRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Taxonomy } from 'projects/laji/src/app/shared/model/Taxonomy';
import { ImageModalOverlayComponent } from 'projects/laji/src/app/shared/gallery/image-gallery/image-modal-overlay.component';
import { Image } from 'projects/laji/src/app/shared/gallery/image-gallery/image.interface';
import { Subscription } from 'rxjs';

const SCROLL_SPEED = 500; // pixels per second

const indexAndArrAfterFilter = <T>(index: number, arr: Array<T>, fn: (element: T) => boolean): [number, Array<T>] => {
  const newArr: T[] = [];
  let newIdx: number = index;

  arr.forEach((element, i) => {
    if (fn(element)) {
      newArr.push(element);
    } else if (i < index) {
      newIdx--;
    }
  });
  return [newIdx, newArr];
};

@Component({
  selector: 'laji-identification-list',
  templateUrl: './identification-list.component.html',
  styleUrls: ['./identification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationListComponent implements OnDestroy {
  @Input() taxon: Taxonomy;

  @ViewChild('speciesContainer') speciesContainer: ElementRef;

  previousScrollTimestamp: DOMHighResTimeStamp;
  scrolling = false;
  scrollDirection = 1;

  destroyMouseupListener: () => void;

  private overlayRef: ComponentRef<ImageModalOverlayComponent>;
  private showModalSub: Subscription;
  private showOverlay = false;

  constructor(
    private renderer: Renderer2,
    elementRef: ElementRef,
    viewContainerRef: ViewContainerRef
  ) {
  }

  discreteScroll(dir: number) {
    this.speciesContainer.nativeElement.scrollLeft += dir * .5 * this.speciesContainer.nativeElement.clientWidth;
  }

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

  openImage(index?: number) {
  }

  closeImage() {
    if (!this.showOverlay) {
      return;
    }
    this.showOverlay = false;
  }

  ngOnDestroy() {
    if (this.destroyMouseupListener) {
      this.destroyMouseupListener();
    }
  }
}
