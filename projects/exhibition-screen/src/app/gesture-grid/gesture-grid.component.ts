import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Renderer2, ViewChild } from "@angular/core";
import { ISlideData } from './slide/slide.component';

@Component({
	selector: 'es-gesture-grid',
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
	styleUrls: ['gesture-grid.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestureGridComponent implements AfterViewInit {
	slides: ISlideData[] = [];
	currentSlide = 0;
	private panOffset = 0;

	@ViewChild('slideContainer') slideContainer: ElementRef;

	constructor(private el: ElementRef, private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

	ngAfterViewInit() {
		this.setSlides([
			{
				bgSrc: 'https://images.pexels.com/photos/3109271/pexels-photo-3109271.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
				bgCaption: 'Image caption 1',
				content: `
<h1>Viheralueet hoitavat mielenterveyttä!</h1>
<p>Elämä nyky-yhteiskunnassa ja erityisesti kaupungeissa on
usein monella tapaa raskasta. Viheralueiden ekologinen merkitys
on ilmeinen, mutta niillä on myös terveydellinen ulottuvuus.
Ihmiset hakeutuvat usein luonnon ääreen toipumaan ja luonnon
hyödyt ihmisten terveyden tukemisessa ja parantamisessa
tunnetaan entistä paremmin. Luonnossa vietetty aika vähentää
stressiä ja sitä kautta ehkäisee tai lieventää monia fyysisiä ja
psyykkisiä oireita, kuten korkeaa verenpainetta, allergioita,
ahdistusta ja masennusta. Samaan aikaan luontoyhteyksien
määrä ja laatu kuitenkin heikkenevät kaikkialla. Kun mietimme
miten ja missä säilytämme ja lisäämme viheralueita, varsinkin
kaupungeissa ja niiden läheisyydessä, ei ole kyse ainoastaan
esteettisistä tai ekologisista vaan myös terveydellisistä hyödyistä.
Parhaan tuloksen aikaansaamiseksi tutkijoiden on tunnistettava
niitä paikkoja, tapoja ja laajempia kokonaisuuksia, joilla voimme
samalla sekä lisätä viheralueita että parantaa ihmisten terveyttä.
</p>
<h3>Alkuperäinen artikkeli:</h3>
<p>
Nature-Based Interventions for Improving Health and Wellbeing:
The Purpose, the People and the Outcomes
<a href="https://helda.helsinki.fi//bitstream/handle/10138/312188/sports_07_00141_v2.pdf?sequence=1">https://helda.helsinki.fi//bitstream/handle/10138/312188/sports_07_00141_v2.pdf?sequence=1</a>
</p>
				`,
				contentPlacement: 'left'
			},
			{
				bgSrc: 'https://images.pexels.com/photos/416728/pexels-photo-416728.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260',
				bgCaption: 'Image caption 2',
				content: `
<h1>Mitä lahopuu on?</h1>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Praesent in dui sollicitudin, rhoncus urna eget, sagittis nibh.
Sed dignissim sem sit amet lectus sollicitudin volutpat.
Duis quis commodo augue. Ut eu enim nunc. Fusce vel ex
massa. Proin a risus a sapien vestibulum rhoncus. Ut at sem
auctor, pellentesque nisi quis, cursus augue. Cras in lorem sed
turpis semper semper. Donec fermentum nisl nec sem cursus,
a consequat nisi cursus. Mauris vel dolor mattis, iaculis erat sed,
condimentum metus. Nullam eget tortor purus. Sed a arcu at
metus porta posuere sed non sem. Ut vehicula luctus est eget
posuere. Sed porttitor, ante at eleifend bibendum, felis quam
porta leo, sit amet varius nisl nisl sed ligula. Nulla diam dolor,
commodo id elit at, condimentum convallis augue.</p>
				`,
				contentPlacement: 'right'
			},
			{
				bgSrc: 'https://images.pexels.com/photos/4081123/pexels-photo-4081123.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
				bgCaption: 'Image caption 3',
				content: 'slide 3 content',
				contentPlacement: 'left'
			}
		]);
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
}