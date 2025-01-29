import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { filter, startWith } from 'rxjs/operators';
import { Lang } from '../core/i18n-map';
import { BugAnimation } from './bug-animation';
import { ISlideData } from './slide/slide.component';
import { SlideshowFacade } from './slideshow.facade';

@Component({
  selector: 'es-slideshow',
  templateUrl: 'slideshow.component.html',
  styleUrls: ['slideshow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideshowComponent implements AfterViewInit, OnDestroy {
  slides: ISlideData[] = [];
  currentSlideIdx = 0;
  private panOffset = 0;
  private bugAnimation!: BugAnimation;

  @ViewChild('slideContainer') slideContainer!: ElementRef;

  constructor(
    private translate: TranslateService,
    private el: ElementRef,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private facade: SlideshowFacade
  ) {}

  ngAfterViewInit() {
    this.bugAnimation = new BugAnimation(this.el, this.renderer);
    this.bugAnimation.init();
    this.translate.onLangChange.pipe(startWith(undefined)).subscribe(() => this.facade.loadSlides());
    this.facade.slides$.pipe(filter(s => s && s.length > 0)).subscribe(slides => {
      this.currentSlideIdx = 0;
      this.bugAnimation.bugPaths = slides[0].animationPlacement!;
      this.setSlides(slides);
    });
  }

  onLangChange(lang: Lang) {
    this.translate.use(lang);
  }

  selectSlide(i: number) {
    this.currentSlideIdx = i;
    this.bugAnimation.bugPaths = this.slides[this.currentSlideIdx].animationPlacement!;
    this.setAnimatable(true);
    this.translateX();
  }

  private setSlides(arr: ISlideData[]) {
    this.slides = arr;
    this.renderer.setStyle(this.slideContainer.nativeElement, 'width', arr.length + '00%');
    this.cdr.detectChanges();
  }

  private translateX() {
    const slideOffset = -1 * this.currentSlideIdx * this.slideContainer.nativeElement.offsetWidth / this.slides.length;
    const offset = slideOffset + this.panOffset;
    this.renderer.setStyle(this.slideContainer.nativeElement, 'transform', `translateX(${offset}px)`);
  }

  private setAnimatable(bool: boolean) {
    if (bool) {
      this.renderer.setStyle(this.slideContainer.nativeElement, 'transition', 'transform .3s cubic-bezier(0.37, 0, 0.63, 1)');
    } else {
      this.renderer.removeStyle(this.slideContainer.nativeElement, 'transition');
    }
  }

  @HostListener('window:resize', ['$event'])
  resize(event: any) {
    this.translateX();
  }

  @HostListener('swiperight', ['$event'])
  swiperight(event: any) {
    if (this.currentSlideIdx > 0) {
      this.selectSlide(this.currentSlideIdx - 1);
    }
  }

  @HostListener('swipeleft', ['$event'])
  swipeleft(event: any) {
    if (this.currentSlideIdx < this.slides.length - 1) {
      this.selectSlide(this.currentSlideIdx + 1);
    }
  }

  @HostListener('panstart', ['$event'])
  panstart(event: any) {
    this.setAnimatable(false);
  }

  @HostListener('panright', ['$event'])
  panright(event: any) {
    this.panOffset = event.deltaX / 4;
    this.translateX();
  }

  @HostListener('panleft', ['$event'])
  panleft(event: any) {
    this.panOffset = event.deltaX / 4;
    this.translateX();
  }

  @HostListener('panend', ['$event'])
  panend(event: any) {
    this.panOffset = 0;
    this.setAnimatable(true);
    this.translateX();
  }

  ngOnDestroy() {
    if (this.bugAnimation) { this.bugAnimation.destroy(); }
  }
}
