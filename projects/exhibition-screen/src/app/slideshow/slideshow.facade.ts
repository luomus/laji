import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Information } from "projects/laji/src/app/shared/model/Information";
import { BehaviorSubject, forkJoin } from "rxjs";
import { filter, map, switchMap } from "rxjs/operators";
import { InformationService } from "../core/information.service";
import { ISlideData } from "./slide/slide.component";
import { i18nMap } from "../core/i18n-map";

@Injectable()
export class SlideshowFacade {
	private store = new BehaviorSubject<ISlideData[]>([]);

	slides$ = this.store.asObservable();

	constructor(private translate: TranslateService, private informationService: InformationService) {}

	loadSlides() {
		this.informationService.getInformation(i18nMap.screenOne[this.translate.currentLang], {}).pipe(
			filter(information => {
				const a = !information.children;
				if (a) { console.warn(`The slideshow root element does not have children: ${information?.id}`) }
				return !a;
			}),
			switchMap(information => forkJoin(...information.children.map(child => this.informationService.getInformation(child.id, {})))),
			map((informationArr: Information[]) => <ISlideData[]>(
				informationArr.map(information => {
					let contentPlacement = 'left';
					let style = 'default';
					let bgSrc = information.featuredImage?.url;
					let bgIsVideo = false;
					information.tags.forEach((curr) => {
						if(curr.startsWith('video:')) {
							bgSrc = 'https://nayttely-cms.luomus.fi/wp-content/uploads/' + curr.split(':')[1];
							bgIsVideo = true;
						}

						switch(curr) {
							case 'align-left':
								contentPlacement = 'left';
								break;
							case 'align-right':
								contentPlacement = 'right';
								break;
							case 'style-front':
								style = 'front';
								break;
							case 'style-default':
								style = 'default';
								break;
						}
					});
					const animationPlacement = [];
					if (contentPlacement === 'left') {
						animationPlacement.push('topright', 'botright');
					} else if (contentPlacement === 'right') {
						animationPlacement.push('topleft', 'botleft');
					}
					return {
						content: information.content,
						title: information.title,
						bgSrc,
						bgIsVideo,
						bgCaption: information.featuredImage?.caption,
						animationPlacement,
						contentPlacement,
						style
					}
				})
			))
		).subscribe(slideData => {
			this.store.next(slideData);
		});
	}
}
