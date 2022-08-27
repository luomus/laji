import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Output } from '@angular/core';
import { Image } from './image.interface';
import { Image as ImageModel } from '../../../../../../laji-api-client/src/lib/models/image';

const licenseLinkMap: Record<ImageModel.IntellectualRightsEnum, string> = {
  'MZ.intellectualRightsCC-BY-SA-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'MZ.intellectualRightsCC-BY-NC-4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
  'MZ.intellectualRightsCC-BY-NC-SA-4.0': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  'MZ.intellectualRightsCC-BY-4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'MZ.intellectualRightsCC0-4.0': 'https://creativecommons.org/share-your-work/public-domain/cc0/',
  'MZ.intellectualRightsODBL-1.0': 'https://opendatacommons.org/licenses/odbl/1-0/',
  'MZ.intellectualRightsPD': 'https://creativecommons.org/share-your-work/public-domain/',
  'MZ.intellectualRightsARR': 'https://en.wikipedia.org/wiki/All_rights_reserved',
  'MZ.intellectualRightsCC-BY-2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'MZ.intellectualRightsCC-BY-SA-2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'MZ.intellectualRightsCC-BY-SA-2.0-DE': 'https://creativecommons.org/licenses/by-sa/2.0/de',
  'MZ.intellectualRightsCC-BY-NC-2.0': 'https://creativecommons.org/licenses/by-nc/2.0/',
  'MZ.intellectualRightsCC-BY-NC-SA-2.0': 'https://creativecommons.org/licenses/by-nc-sa/2.0/',
  'MZ.intellectualRightsCC-BY-NC-ND-2.0': 'https://creativecommons.org/licenses/by-nc-nd/2.0/',
  'MZ.intellectualRightsCC-BY-SA-2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
  'MZ.intellectualRightsCC-BY-SA-2.5-SE': 'https://creativecommons.org/licenses/by-sa/2.5/se/',
  'MZ.intellectualRightsCC-BY-3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'MZ.intellectualRightsCC-BY-SA-3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'MZ.intellectualRightsCC-BY-NC-SA-3.0': 'https://creativecommons.org/licenses/by-nc-sa/3.0/',
  'MZ.intellectualRightsCC-BY-ND-4.0': 'https://creativecommons.org/licenses/by-nd/4.0/',
  'MZ.intellectualRightsCC-BY-NC-ND-4.0': 'https://creativecommons.org/licenses/by-nc-nd/4.0/'
};

@Component({
  selector: 'laji-image-gallery-overlay',
  styleUrls: ['./image-modal.component.css'],
  templateUrl: './image-modal-overlay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageModalOverlayComponent {
  public img: Image;
  public currentImageIndex: number;
  public modalImages: Image[];
  public showLinkToSpeciesCard: boolean;
  @Output() cancelEvent = new EventEmitter<any>();
  @Output() showModal = new EventEmitter<boolean>();

  constructor(
   private cdr: ChangeDetectorRef
  ) { }

  getLicenseLink(license: string): string {
    return licenseLinkMap[license.match(/(MZ\..*)/)[1]];
  }

  closeGallery() {
    this.modalImages = [];
    this.cancelEvent.emit(null);
    this.showModal.emit(false);
  }

  prevImage() {
    this.currentImageIndex--;
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = this.modalImages.length - 1;
    }
    this.showImage(this.currentImageIndex);
  }

  nextImage() {
    this.currentImageIndex++;
    if (this.modalImages.length === this.currentImageIndex) {
      this.currentImageIndex = 0;
    }
    this.showImage(this.currentImageIndex);
  }

  showImage(index) {
    if (!index) {
      this.currentImageIndex = 1;
    }
    this.currentImageIndex = index;
    if (this.modalImages[index]) {
      this.img = this.modalImages[index];
    }
    this.showModal.emit(true);
    this.cdr.markForCheck();
  }

  @HostListener('document:keydown', ['$event'])
  modalKeyDown(e: KeyboardEvent)  {
    e.stopPropagation();
    if (e.keyCode === 27) { // esc
      e.preventDefault();
      this.closeGallery();
    }
    if (e.keyCode === 37 && this.modalImages.length > 0 && this.currentImageIndex > 0) { // left
      e.preventDefault();
      this.prevImage();
    }
    if (e.keyCode === 39 && this.modalImages.length > 0 && this.currentImageIndex < this.modalImages.length - 1) { // right
      e.preventDefault();
      this.nextImage();
    }
  }
}
