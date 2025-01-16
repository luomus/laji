// RGB HSL conversions adapted from https://stackoverflow.com/a/9493060

const hueToRgb = (p: number, q: number, t: number) => {
  if (t < 0) { t += 1; }
  if (t > 1) { t -= 1; }
  if (t < 1/6) { return p + (q - p) * 6 * t; }
  if (t < 1/2) { return q; }
  if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
  return p;
};

const hslToRgb = (h: number, s: number, l: number) => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1/3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  // eslint-disable-next-line prefer-const
  let h: number, s: number, l: number = (max + min) / 2;

  if (max === min) {
      h = s = 0; // achromatic
  } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
          default: h = 0; break;
      }
      h /= 6;
  }

  return [h, s, l];
};

const parseHex = (str: string, start: number, end: number) => parseInt(str.substring(start, end), 16);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// inputs hex colors, outputs a hex color, t ∈ 0..1
export const colorGradientLerp = (start: string, end: string, t: number): string => {
  const startHsl = rgbToHsl(parseHex(start, 0, 2), parseHex(start, 2, 4), parseHex(start, 4, 6));
  const endHsl = rgbToHsl(parseHex(end, 0, 2), parseHex(end, 2, 4), parseHex(end, 4, 6));
  const outRgb = hslToRgb(
    lerp(startHsl[0]!, endHsl[0]!, t),
    lerp(startHsl[1]!, endHsl[1]!, t),
    lerp(startHsl[2]!, endHsl[2]!, t)
  );
  return outRgb.map(c => c.toString(16)).map(s => s.length < 2 ? '0' + s : s).join('');
};

export const discreteColorGradient = (start: string, end: string, count: number): string[] => (
  (new Array(count)).fill(null).map((v, i) => colorGradientLerp(start, end, i / (count - 1)))
);
