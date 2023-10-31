import { ChangeDetectionStrategy, Component, Input,
ElementRef, ViewChild, Renderer2, ComponentRef, ViewContainerRef, OnDestroy, EnvironmentInjector, Inject } from '@angular/core';
import { Taxonomy } from 'projects/laji/src/app/shared/model/Taxonomy';
import { ImageModalOverlayComponent } from 'projects/laji/src/app/shared/gallery/image-gallery/image-modal-overlay.component';
import { Image } from 'projects/laji/src/app/shared/gallery/image-gallery/image.interface';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';

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
    private viewContainerRef: ViewContainerRef,
    private _renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private envInjector: EnvironmentInjector,
  ) { }

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

    this.overlayRef = this.viewContainerRef.createComponent(ImageModalOverlayComponent,
      {
        environmentInjector: this.envInjector
      });
    this._renderer.appendChild(this.document.body, this.overlayRef.location.nativeElement);

    this.showOverlay = true;

    if (this?.taxon?.species) {
      this.overlayRef.instance.modalImages = this.taxon.multimedia.map((media, i) => {
        const image = <Image>{
          ...this.taxon.multimedia[i],
          taxonId: this.taxon.id,
          vernacularName: this.taxon.vernacularName,
          scientificName: this.taxon.scientificName
        };
        return image;
      });
      this.overlayRef.instance.showImage(index);
    } else if (this.taxon.children?.length === 0) {
      this.overlayRef.instance.modalImages = [<Image>{
        ...this.taxon.multimedia[0],
        taxonId: this.taxon.id,
        vernacularName: this.taxon.vernacularName,
        scientificName: this.taxon.scientificName
      }];
      this.overlayRef.instance.showImage(0);
    } else if (this.taxon.children?.length > 0) {
      const [filteredIndex, filteredChildren] = indexAndArrAfterFilter(
        index, this.taxon.children,
        taxonomy => taxonomy.multimedia && taxonomy.multimedia.length > 0
      );
      this.overlayRef.instance.modalImages = filteredChildren.map(taxonomy => <Image>{
          ...taxonomy.multimedia[0],
          taxonId: taxonomy.id,
          vernacularName: taxonomy.vernacularName,
          scientificName: taxonomy.scientificName
        });
      this.overlayRef.instance.showImage(filteredIndex);
    }

    if (this.showModalSub) { this.showModalSub.unsubscribe(); }
    this.showModalSub = this.overlayRef.instance.showModal.subscribe(state => {
      if (state === false) { this.closeImage(); }
    });
    this.overlayRef.instance.showLinkToSpeciesCard = true;
  }

  closeImage() {
    if (!this.showOverlay) {
      return;
    }
    this.showOverlay = false;
    this.overlayRef.destroy();
  }

  ngOnDestroy() {
    if (this.destroyMouseupListener) {
      this.destroyMouseupListener();
    }
    this.overlayRef?.destroy();
  }
}
