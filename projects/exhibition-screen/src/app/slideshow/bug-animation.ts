import { ElementRef, Renderer2 } from "@angular/core";
import { interval, Subject } from "rxjs";
import { delay, switchMap, takeUntil } from "rxjs/operators"
import { AnimationEngine } from "../../animations/animation-engine";
import { CurveFollower, EsAnimatable } from "../../animations/es-animatable";

const INITIAL_DELAY = 20000;
const INTERVAL_DELAY = 10000;

const roundToTwoDecimals = (n: number) => Math.round(n * 100) / 100;

export class BugAnimation {
	private unsubscribe$ = new Subject<void>();
	private destroyClickListener;
	private destroyTouchListener;

	private input$ = new Subject<void>();

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
				this.bug = new CurveFollower([[400, -100], [400, 400], [-100, 400]], 5);
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
