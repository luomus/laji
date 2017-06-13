import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { ScriptService } from '../service/script.service';

@Component({
  selector: 'laji-image',
  template: ' ',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements AfterViewInit, OnDestroy, OnChanges {

  @Input() src: string;
  @Input() showNavigator = true;
  @Output() loading = new EventEmitter<boolean>();

  private viewer: any;
  private current: string;
  private loaded = false;

  constructor(
    private el: ElementRef,
    private scriptService: ScriptService
  ) {}

  ngAfterViewInit() {
    this.scriptService.load('openseadragon')
      .subscribe(
        () => {
          this.loaded = true;
          this.updateImage();
        },
        (err) => console.log(err)
      );
  }

  ngOnChanges() {
    this.updateImage();
  }

  ngOnDestroy() {
    this.destroy();
  }

  private destroy() {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }

  private updateImage() {
    if (!this.src || this.current === this.src || !this.loaded) {
      return;
    }
    this.current = this.src;
    this.destroy();
    this.loading.emit(true);
    this.viewer = OpenSeadragon({
      element: this.el.nativeElement,
      animationTime: 0.7,
      prefixUrl: '/static/images/openseadragon/',
      showNavigator: this.showNavigator,
      showRotationControl: true,
      navigatorPosition: 'ABSOLUTE',
      navigatorTop: '35px',
      navigatorLeft: '4px',
      navigatorHeight: '100px',
      navigatorWidth: '133px',
      maxZoomPixelRatio: 2,
      tileSources: [{
        type: 'image',
        url: this.src
      }]
    });
    this.viewer.addHandler('tile-loaded', () => {
      this.loading.emit(false);
    });
  }

}
