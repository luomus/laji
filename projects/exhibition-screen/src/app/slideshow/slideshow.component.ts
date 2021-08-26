import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, Renderer2, ViewChild } from "@angular/core";
import { BugAnimation } from "./bug-animation";
import { ISlideData } from './slide/slide.component';
import { SlideshowFacade } from "./slideshow.facade";

@Component({
	selector: 'es-slideshow',
	template: `
<div class="slide-container" #slideContainer>
	<es-slide *ngFor="let d of slides" [data]="d"></es-slide>
</div>
<div class="langSelect">
	valitse kieli
</div>
<div class="currentSlide panel">
	slide: {{currentSlide + 1}}
</div>
	`,
	styleUrls: ['slideshow.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideshowComponent implements AfterViewInit, OnDestroy {
	slides: ISlideData[] = [];
	currentSlide = 0;
	private panOffset = 0;
	private bugAnimation: BugAnimation;

	@ViewChild('slideContainer') slideContainer: ElementRef;

	constructor(private el: ElementRef, private renderer: Renderer2, private cdr: ChangeDetectorRef, private facade: SlideshowFacade) {}

	ngAfterViewInit() {
		this.bugAnimation = new BugAnimation(this.el, this.renderer);
		this.bugAnimation.init();
		this.facade.loadSlides();
		this.facade.slides$.subscribe(slides => {
			this.setSlides(slides)
		});
	}

	private setSlides(arr: ISlideData[]) {
		this.slides = arr;
		this.renderer.setStyle(this.slideContainer.nativeElement, 'width', arr.length + '00%');
		this.cdr.detectChanges();
	}

	private translateX() {
		const slideOffset = -1 * this.currentSlide * this.slideContainer.nativeElement.offsetWidth / this.slides.length;
		const offset = slideOffset + this.panOffset;
		this.renderer.setStyle(this.slideContainer.nativeElement, 'transform', `translateX(${offset}px)`);
	}

	private setAnimatable(bool: boolean) {
		if (bool) {
			this.renderer.setStyle(this.slideContainer.nativeElement, 'transition', 'transform .3s cubic-bezier(0.37, 0, 0.63, 1)')
		} else {
			this.renderer.removeStyle(this.slideContainer.nativeElement, 'transition');
		}
	}

	@HostListener('window:resize', ['$event'])
	resize(event) {
		this.translateX();
	}

  @HostListener('swiperight', ['$event'])
  swiperight(event) {
		if (this.currentSlide > 0) {
			this.currentSlide--;
			this.setAnimatable(true);
			this.translateX();
		}
  }

  @HostListener('swipeleft', ['$event'])
  swipeleft(event) {
		if (this.currentSlide < this.slides.length - 1) {
			this.currentSlide++;
			this.setAnimatable(true);
			this.translateX();
		}
  }

  @HostListener('panstart', ['$event'])
  panstart(event) {
		this.setAnimatable(false);
  }

  @HostListener('panright', ['$event'])
  panright(event) {
		this.panOffset = event.deltaX / 4;
		this.translateX();
  }

  @HostListener('panleft', ['$event'])
  panleft(event) {
		this.panOffset = event.deltaX / 4;
		this.translateX();
  }

  @HostListener('panend', ['$event'])
  panend(event) {
		this.panOffset = 0;
		this.setAnimatable(true);
		this.translateX();
  }

	ngOnDestroy() {
		if (this.bugAnimation) { this.bugAnimation.destroy() }
	}
}