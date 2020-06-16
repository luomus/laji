export class KerttuUtils {
  public static getPaddedRange(range: number[], padding: number, minValue: number, maxValue: number) {
    if (padding == null) {
      return [minValue, maxValue];
    }

    let start = range[0] - padding;
    let stop = range[1] + padding;

    if (start < minValue) {
      stop = Math.min(stop + (minValue - start), maxValue);
      start = minValue;
    }
    if (stop > maxValue) {
      start = Math.max(start - (stop - maxValue), minValue);
      stop = maxValue;
    }

    return [start, stop];
  }
}
