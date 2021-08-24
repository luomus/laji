export const degToRad =  (deg: number) => deg / 360 * 2 * Math.PI;
export const radToDeg = (rad: number) => rad / (2 * Math.PI) * 360;

export type V2 = [number, number];
export type Deg = number;
export const V2 = {
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
	rotRad: (v: V2, rad: number): V2 => [Math.cos(rad) * v[0] - Math.sin(rad) * v[1], Math.sin(rad) * v[0] + Math.cos(rad) * v[1]], // anticlockwise rotation
	lerp: (a: V2, b: V2, t: number) => V2.add(a, V2.scale(V2.sub(b, a), t)), // a + (b - a) * t
	quadraticBezier: (a: V2, b: V2, c: V2, t: number) => {
		const ab = V2.lerp(a, b, t);
		const cb = V2.lerp(c, b, 1-t);
		return V2.lerp(ab, cb, t);
	}
}