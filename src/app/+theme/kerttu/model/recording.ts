export interface IRecording {
  id: string;
  audio: string;
  spectrogram: string;
}

export interface IRecordingWithCandidates {
  template: IRecording;
  candidates: IRecording[];
}
