import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, Renderer2 } from "@angular/core";

export interface ISlideData {
	bgSrc: string;
	bgIsVideo: boolean;
	bgCaption: string;
	contentPlacement: 'left' | 'right';
	content: string;
	animationPlacement: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
}

@Component({
	selector: 'es-slide',
	templateUrl: 'slide.component.html',
	styleUrls: ['slide.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideComponent implements OnChanges {
	@Input() data: ISlideData;

	constructor(private el: ElementRef, private renderer: Renderer2) {}

	ngOnChanges() {
		if (!this.data.bgIsVideo) {
			this.renderer.setStyle(this.el.nativeElement, 'background-image', `url(${this.data.bgSrc})`);
		}
	}
}
