import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {IRecording} from '../model/recording';

@Component({
  selector: 'laji-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss']
})
export class AudioViewerComponent implements OnInit {
  @ViewChild('audioPlayer', {static: false}) playerRef: ElementRef<HTMLAudioElement>;

  @Input() recording: IRecording;

  isPlaying = false;

  constructor() { }

  ngOnInit() {
  }

  toggleAudio() {
    const player = this.playerRef.nativeElement;

    if (player.paused) {
      player.play();
      this.isPlaying = true;
    } else {
      player.pause();
      this.isPlaying = false;
    }
  }

  setVolume(val: number) {
    const player = this.playerRef.nativeElement;
    player.volume = val / 100;
  }
}
