export interface IRecording {
  audio: string;
  spectrogram: string;
}

export interface IRecordingWithCandidates {
  template: IRecording;
  candidates: IRecording[];
}
