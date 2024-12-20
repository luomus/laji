export class AudioViewerUtils {
  public static getPaddedRange(range: number[]|undefined, padding: number|undefined, minValue: number, maxValue: number): number[] {
    if (!range || padding == null) {
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

  public static getMaxFreq(sampleRate: number): number {
    return Math.floor(sampleRate / 2);
  }

  public static getSpectrogramSegmentLength(tarwindowLength: number, sampleRate: number): number {
    const targetNperseg = Math.round(tarwindowLength * sampleRate);
    return Math.pow(2, Math.round(Math.log(targetNperseg) / Math.log(2))); // find the closest power of two because the spectrogram script requires it to be power of two
  }
}
