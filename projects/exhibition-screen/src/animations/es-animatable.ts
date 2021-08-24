import { Deg, degToRad, V2 } from "./math";

export interface EsAnimatable {
	pos: V2;
	rot: Deg;
	update(dt: number): boolean;
}

export class PathFollower implements EsAnimatable {
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

	private speed: number = 0; // pixels per second

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

		const a = this.accel * V2.dot(this.dir, V2.normalize(posToTarget));
		const maxSpeed = this.path.length === 1 ? Math.min(this.maxSpeed, distToTarget / this.deaccelDistance * this.maxSpeed): this.maxSpeed;
		this.speed = Math.min(maxSpeed, Math.max(0, this.speed + a * dt));
		this.pos = V2.add(this.pos, V2.scale(this.dir, this.speed * dt));
		this.rot = V2.toDeg([this.dir[0], -this.dir[1]]); // flip y axis

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

export class CurveFollower implements EsAnimatable {
	public pos: V2 = [0, 0];
	public rot: Deg = 0;

	private timeElapsed = 0;

	constructor(private points: [V2, V2, V2], private duration: number) {}

	update(dt: number) {
		this.timeElapsed += dt;
		const newPos = V2.quadraticBezier(this.points[0], this.points[1], this.points[2], this.timeElapsed / this.duration);
		const toNewPos = V2.sub(newPos, this.pos);
		this.pos = newPos;
		this.rot = V2.toDeg([toNewPos[0], -toNewPos[1]]); // flip y axis
		
		if (this.timeElapsed >= this.duration) {
			return false;
		}
		return true;
	}
}
