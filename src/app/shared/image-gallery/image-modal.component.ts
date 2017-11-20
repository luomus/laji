import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output, Renderer,
  ViewContainerRef
} from '@angular/core';
import { Image } from './image.interface';
import { ComponentLoader, ComponentLoaderFactory } from 'ngx-bootstrap';
import { ImageModalOverlayComponent } from './image-modal-overlay.component';

/**
 * Originally from here https://github.com/vimalavinisha/angular2-image-popup
 *
 * Added features:
 *  * keyboard actions for left right and esc PR#9
 *
 * Changes:
 *  * using taxonomyImage result instead of generic one
 *  * removed dependency on font-awesome
 *  * style fixes
 *
 * Original license:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 vimalavinisha
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * This is modified to out needs
 */

@Component({
  selector: 'laji-image-gallery',
  styleUrls: ['./image-modal.component.css'],
  templateUrl: './image-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageModalComponent implements OnInit, OnDestroy {
  public opened = false;
  public img: Image;
  public loading = false;
  public showRepeat = false;
  @Input() eventOnClick = false;
  @Input() view: 'compact'|'full' = 'compact';
  @Input() modalImages: Image[];
  @Input() imagePointer: number;
  @Input() showViewSwitch = false;
  @Output() cancelEvent = new EventEmitter<any>();
  @Output() select = new EventEmitter<{documentId: string, unitId: string}>();
  public overlay: ComponentRef<ImageModalOverlayComponent>;
  private _overlay: ComponentLoader<ImageModalOverlayComponent>;
  private _isShown = false;

  constructor(_viewContainerRef: ViewContainerRef,
              _renderer: Renderer,
              _elementRef: ElementRef,
              cis: ComponentLoaderFactory) {
    this._overlay = cis
      .createLoader<ImageModalOverlayComponent>(_elementRef, _viewContainerRef, _renderer);
  }

  ngOnInit() {
    this.loading = true;
    if (this.imagePointer >= 0) {
      this.showRepeat = false;
      this.openImage(this.imagePointer);
    } else {
      this.showRepeat = true;
    }
  }

  ngOnDestroy() {
    this._overlay.dispose();
  }

  openImage(index) {
    if (this.eventOnClick) {
      if (this.modalImages[index]) {
        this.select.emit({
          documentId: this.modalImages[index].documentId,
          unitId: this.modalImages[index].unitId
        })
      }
      return;
    }
    this._overlay
      .attach(ImageModalOverlayComponent)
      .to('body')
      .show({isAnimated: false});
    this._isShown = true;
    this.overlay = this._overlay._componentRef;
    this.overlay.instance.modalImages = this.modalImages;
    this.overlay.instance.showImage(index);
    this.overlay.instance.close = () => {
      this.closeImage();
    };
  }

  closeImage() {
    if (!this._isShown) {
      return;
    }
    this._isShown = false;
    this._overlay.hide();
  }

  setView(viewType) {
    if (this.view !== viewType) {
      this.view = viewType;
    }
  }
}
