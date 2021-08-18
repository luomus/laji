import { ElementRef, Renderer2 } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { delay, takeUntil } from "rxjs/operators"

const randomDelay = () => (60 + Math.random() * 20) * 1000;
const roundTo2Decimals = (n: number) => Math.round(n * 100) / 100;

export class BugAnimation {
	private input$ = new Subject<void>();

	private bugEl: HTMLElement;

	private bug: PathFollower;
	private lastLoop: DOMHighResTimeStamp;

	constructor(private baseEl: ElementRef, private renderer: Renderer2) {}

	restartTimer() {
		this.input$.next();
		this.init();
	}

	private init() {
		of(undefined).pipe(
			//delay(randomDelay()),
			takeUntil(this.input$)
		).subscribe(
			//this.startAnimation.bind(this)
			this.followMouse.bind(this)
		);
	}

	private startAnimation() {
		this.bugEl = this.renderer.createElement('div');
		this.renderer.addClass(this.bugEl, 'bug-animation');
		this.renderer.appendChild(this.baseEl.nativeElement, this.bugEl);

		this.bug = new PathFollower();
		this.bug.pos = [400,-100];
		this.bug.path = [[400,400], [-100, 400]];
		
		this.lastLoop = performance.now();
		window.requestAnimationFrame(this.loop.bind(this));
	}
	
	private loop() {
		const now = performance.now();
		const dt = (now - this.lastLoop) / 1000;
		const s = this.bug.update(dt);

		this.renderer.setStyle(this.bugEl, 'transform', `translate(${roundTo2Decimals(this.bug.pos[0])}px, ${roundTo2Decimals(this.bug.pos[1])}px) rotate(${roundTo2Decimals(this.bug.rot)}deg)`);

		if (!s) {
			this.renderer.removeChild(this.baseEl.nativeElement, this.bugEl);
			return;
		}

		this.lastLoop = now;
		window.requestAnimationFrame(this.loop.bind(this));
	}
	
	/////////////////////////////////

	private followMouse() {
		this.bugEl = this.renderer.createElement('div');
		this.renderer.addClass(this.bugEl, 'bug-animation');
		this.renderer.appendChild(this.baseEl.nativeElement, this.bugEl);

		this.bug = new PathFollower();
		this.bug.path = [[0,0]];
		this.bug.positionOffset = [-50, -50];
		
		this.renderer.listen(this.baseEl.nativeElement, 'mousemove', (e) => {
			this.bug.path = [[e.clientX, e.clientY]];
		});
		this.lastLoop = performance.now();
		window.requestAnimationFrame(this.followMouseLoop.bind(this));
	}

	private followMouseLoop() {
		const now = performance.now();
		const dt = (now - this.lastLoop) / 1000;
		const s = this.bug.update(dt);

		this.renderer.setStyle(this.bugEl, 'transform', `translate(${roundTo2Decimals(this.bug.pos[0]) + this.bug.positionOffset[0]}px, ${roundTo2Decimals(this.bug.pos[1]) + this.bug.positionOffset[1]}px) rotate(${roundTo2Decimals(this.bug.rot)}deg)`);

		this.lastLoop = now;
		window.requestAnimationFrame(this.followMouseLoop.bind(this));
	}
}

const degToRad =  (deg: number) => deg / 360 * 2 * Math.PI;
const radToDeg = (rad: number) => rad / (2 * Math.PI) * 360;

type V2 = [number, number];
type Deg = number;
const V2 = {
	scale: (v: V2, s: number): V2 => ([v[0] * s, v[1] * s]),
	add: (a: V2, b: V2): V2 => ([a[0] + b[0], a[1] + b[1]]),
	sub: (a: V2, b: V2): V2 => ([a[0] - b[0], a[1] - b[1]]),
	normalize: (v: V2): V2 => {
		const mag = V2.mag(v);
		if (mag === 0) { return [0, 0] }
		return [v[0] / mag, v[1] / mag];
	},
	mag: (v: V2): number => Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2)),
	dist: (a: V2, b: V2): number => V2.mag(V2.sub(b, a)),
	toDeg: (v: V2): number => (360 + Math.atan2(v[0], v[1]) * 180 / Math.PI) % 360,
	ceil: (v: V2, max: number) => {
		if (V2.mag(v) > max) {
			return V2.scale(V2.normalize(v), max);
		} else return v;
	},
	dot: (a: V2, b: V2): number => a[0] * b[0] + a[1] * b[1],
	rotRad: (v: V2, rad: number): V2 => [Math.cos(rad) * v[0] - Math.sin(rad) * v[1], Math.sin(rad) * v[0] + Math.cos(rad) * v[1]] // anticlockwise rotation
}

class PathFollower {
	public path: V2[] = [];
	public pos: V2 = [0, 0];
	public rot: Deg = 0;
	public positionOffset: V2 = [0, 0];
	public turnRate: number = 180;
	public accel: number = 100; // pixels per second^2
	public maxSpeed: number = 200; // pixels per second
	public dir: V2 = [0, 1];
	public deaccelDistance = 200;
	public pathNodeClosenessThreshold = 10;

	private elapsedTime = 0;

	private speed: number = 0; // pixels per second

	private wobbleRate = 2; // wobbles per second
	private wobbleStrength = 10; // deg

	update(dt: number): boolean { // returns false if finished
		const target = this.path[0];

		const posToTarget = V2.sub(target, this.pos);
		const distToTarget = V2.mag(posToTarget);

		const posToTargetRot = V2.toDeg(posToTarget);
		const dirRot = V2.toDeg(this.dir);
		let rotDiff = posToTargetRot - dirRot; // deg
		if (rotDiff > 180) { rotDiff -= 360 }
		if (rotDiff < -180) { rotDiff += 360 }
		const s = rotDiff > 0 ? 1 : -1;
		const rotDiffAbs = Math.abs(rotDiff);
		const rotAmt = Math.max(-rotDiffAbs, Math.min(rotDiffAbs, s * this.turnRate * dt)); // clockwise
		this.dir = V2.rotRad(this.dir, degToRad(-rotAmt));

		const a = this.accel * Math.min(
			V2.dot(this.dir, V2.normalize(posToTarget)),
			distToTarget / this.deaccelDistance - 1
		);
		this.speed = Math.min(this.maxSpeed, Math.max(0, this.speed + a * dt));
		this.pos = V2.add(this.pos, V2.scale(this.dir, this.speed * dt));
		this.rot = V2.toDeg([this.dir[0], -this.dir[1]]); // flip y axis

		this.elapsedTime += dt;

		if (V2.dist(this.pos, target) < this.pathNodeClosenessThreshold) {
			if (this.path.length === 1) {
				return false;
			} else {
				this.path.shift();
			}
		}
		return true;
	}
}
