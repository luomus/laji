import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { PlatformService } from '../../service/platform.service';

let OpenSeadragon: any;

@Component({
  selector: 'laji-image',
  template: ' ',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements AfterViewInit, OnDestroy, OnChanges {

  @Input() src: string;
  @Input() showNavigator = true;
  @Output() loading = new EventEmitter<boolean>();

  private osd: any;
  private current: string;
  private loaded = false;

  constructor(
    private el: ElementRef,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit() {
    if (this.platformService.isBrowser) {
      import('openseadragon')
        .then((m: any) => {
          OpenSeadragon = m.default;
          this.loaded = true;
          this.updateImage();
        });
    }
  }

  ngOnChanges() {
    this.updateImage();
  }

  ngOnDestroy() {
    this.destroy();
  }

  private destroy() {
    if (this.osd) {
      this.osd.destroy();
    }
  }

  private updateImage() {
    if (!this.src || this.current === this.src || !this.loaded) {
      return;
    }
    this.current = this.src;
    this.destroy();
    this.loading.emit(true);
    this.osd = OpenSeadragon({
      element: this.el.nativeElement,
      animationTime: 0.7,
      prefixUrl: '/static/images/openseadragon-icons/',
      showNavigator: this.showNavigator,
      showRotationControl: true,
      navigatorPosition: 'ABSOLUTE',
      navigatorTop: '55px',
      navigatorLeft: '5px',
      navigatorHeight: '100px',
      navigatorWidth: '133px',
      maxZoomPixelRatio: 1, // IE11 cannot handle bigger zoom ratio
      tileSources: [{
        type: 'image',
        url: this.src
      }]
    });
    this.osd.addHandler('tile-loaded', () => {
      this.loading.emit(false);
    });
  }

}
