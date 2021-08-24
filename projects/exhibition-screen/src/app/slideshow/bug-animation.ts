import { ElementRef, Renderer2 } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { delay, takeUntil } from "rxjs/operators"
import { AnimationEngine } from "../../animations/animation-engine";
import { CurveFollower, EsAnimatable, PathFollower } from "../../animations/es-animatable";

const randomDelay = () => (60 + Math.random() * 20) * 1000;
const roundToTwoDecimals = (n: number) => Math.round(n * 100) / 100;

export class BugAnimation {
	private input$ = new Subject<void>();

	private bugEl: HTMLElement;
	private bug: EsAnimatable;
	private anim: AnimationEngine;

	constructor(private baseEl: ElementRef, private renderer: Renderer2) {}

	restartTimer() {
		this.input$.next();
		this.init();
	}

	private init() {
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
			() => {
				this.renderer.removeChild(this.baseEl.nativeElement, this.bugEl);
			}
		);

		of(undefined).pipe(
			//delay(randomDelay()),
			takeUntil(this.input$)
		).subscribe(
			() => this.anim.play()
		);
	}
}
