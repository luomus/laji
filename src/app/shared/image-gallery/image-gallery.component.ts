import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { ModalDirective, MODAL_DIRECTIVES, BS_VIEW_PROVIDERS } from 'ng2-bootstrap/ng2-bootstrap';

import { TaxonomyImage } from '../../shared';

@Component({
    selector: 'laji-image-gallery',
    templateUrl: './image-gallery.component.html',
    styleUrls: ['./image-gallery.component.css'],
    directives: [MODAL_DIRECTIVES, ModalDirective],
    providers: [BS_VIEW_PROVIDERS]
})
export class ImageGalleryComponent {
    @Input() public images: Array<TaxonomyImage>;
    
    @Input() public activeImage: number;
    @Output() activeImageChange: EventEmitter<number> = new EventEmitter<number>();

    @ViewChild('childModal') public childModal: ModalDirective;

    getCurrentImage() {
        return this.images[this.activeImage];
    }

    getImageLength() {
        return this.images.length;
    }

    setActive(id) {
        if (id >= 0 && id < this.images.length) {
            this.activeImageChange.emit(id);
        }
    }
}
