import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';

import { TaxonomyImage } from '../../shared';

@Component({
    selector: 'laji-image-gallery',
    templateUrl: './image-gallery.component.html',
    styleUrls: ['./image-gallery.component.css']
})
export class ImageGalleryComponent {
    @Input() public images: Array<TaxonomyImage>;

    @Input() public activeImage:number;
    @Output() activeImageChange: EventEmitter<number> = new EventEmitter<number>();

    @ViewChild('childModal') public childModal: ModalDirective;

    public itemsPerPage: number = 1;
    public maxSize: number = 3;

    getImageLength() {
        return this.images.length;
    }

    public naks(event) {
        this.childModal.show();
        event.preventDefault();
    }

    public pageChanged(event:any):void {
        this.activeImageChange.emit(event.page);
    }
}
