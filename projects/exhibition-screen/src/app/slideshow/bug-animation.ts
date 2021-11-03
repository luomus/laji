import { ElementRef, Renderer2 } from "@angular/core";
import { interval, Subject } from "rxjs";
import { delay, switchMap, takeUntil } from "rxjs/operators"
import { AnimationEngine } from "../../animations/animation-engine";
import { ConfusedCurveFollower, EsAnimatable, PathFollower } from "../../animations/es-animatable";
import { V2 } from "../../animations/math";

export type BugPath = 'topleft' | 'topright' | 'botright' | 'botleft';

const INITIAL_DELAY = 20000;
const INTERVAL_DELAY = 10000;
const START_OFFSET_PX = 200;

const randomChoice = (n: number) => Math.floor(Math.random() * n);
const roundToTwoDecimals = (n: number) => Math.round(n * 100) / 100;
const bugPathToV2Arr = (p: BugPath, canvasW: number, canvasH: number): V2[] => {
	switch (p) {
		case 'topleft':
			return (<V2[][]>[
				[[400, -START_OFFSET_PX], [400, 400], [-START_OFFSET_PX, 400]],
				[[-START_OFFSET_PX, 400], [400, 400], [400, -START_OFFSET_PX]]
			])[randomChoice(2)];
		case 'topright':
			return (<V2[][]>[
				[[canvasW - 400, -START_OFFSET_PX], [canvasW - 400, 400], [canvasW + START_OFFSET_PX, 400]],
				[[canvasW + START_OFFSET_PX, 400], [canvasW - 400, 400], [canvasW - 400, -START_OFFSET_PX]]
			])[randomChoice(2)];
		case 'botright':
			return (<V2[][]>[
				[[canvasW - 400, canvasH + START_OFFSET_PX], [canvasW - 400, canvasH - 400], [canvasW + START_OFFSET_PX, canvasH - 400]],
				[[canvasW + START_OFFSET_PX, canvasH - 400], [canvasW - 400, canvasH - 400], [canvasW - 400, canvasH + START_OFFSET_PX]]
			])[randomChoice(2)];
		case 'botleft':
			return (<V2[][]>[
				[[400, canvasH + START_OFFSET_PX], [400, canvasH - 400], [-START_OFFSET_PX, canvasH - 400]],
				[[-START_OFFSET_PX, canvasH - 400], [400, canvasH - 400], [400, canvasH + START_OFFSET_PX]]
			])[randomChoice(2)];
		default:
			return [];
	}
};

export class BugAnimation {
	private unsubscribe$ = new Subject<void>();
	private destroyClickListener;
	private destroyTouchListener;

	private input$ = new Subject<void>();

	public bugPaths: BugPath[] = ['topleft', 'topright', 'botright', 'botleft'];
	private bugEl: HTMLElement;
	private bug: EsAnimatable;
	private anim: AnimationEngine;

	constructor(private baseEl: ElementRef, private renderer: Renderer2) {}

	init() {
		this.anim = new AnimationEngine(
			// init
			() => {
				this.bugEl = this.renderer.createElement('div');
				this.renderer.addClass(this.bugEl, 'bug-animation');
				this.renderer.appendChild(this.baseEl.nativeElement, this.bugEl);
				
				const pathIdx = randomChoice(this.bugPaths.length);
				const w = window.innerWidth;
				const h = window.innerHeight;
				const path = bugPathToV2Arr(this.bugPaths[pathIdx], w, h);
				if (path.length === 3) {
					this.bug = new ConfusedCurveFollower(<[V2, V2, V2]>path, 5 + Math.random() * 2);
				} else {
					const pf = new PathFollower();
					pf.path = path;
					this.bug = pf;
				}
				this.bug.pos = path[0];
			},
			// update
			(dt) => {
				const s = this.bug.update(dt);
				this.renderer.setStyle(this.bugEl, 'transform', `translate(${roundToTwoDecimals(this.bug.pos[0])}px, ${roundToTwoDecimals(this.bug.pos[1])}px) rotate(${roundToTwoDecimals(this.bug.rot)}deg)`);
				return s;
			},
			// destroy
			this.destroyAnim.bind(this)
		);

		this.destroyClickListener = this.renderer.listen(window, 'click', () => this.input$.next());
		this.destroyTouchListener = this.renderer.listen(window, 'touchstart', () => this.input$.next());
		
		this.input$.pipe(
			takeUntil(this.unsubscribe$),
			delay(INITIAL_DELAY),
			switchMap(() => interval(INTERVAL_DELAY).pipe(takeUntil(this.input$)))
		).subscribe(() => this.anim.play());

		this.input$.next();
	}

	private destroyAnim() {
		if (this.baseEl && this.bugEl) { this.renderer.removeChild(this.baseEl.nativeElement, this.bugEl) }
	}

	destroy() {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();

		if (this.destroyClickListener) { this.destroyClickListener() }
		if (this.destroyTouchListener) { this.destroyTouchListener() }

		this.destroyAnim();
	}
}
