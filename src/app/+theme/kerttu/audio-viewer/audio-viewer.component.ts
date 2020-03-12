import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {IRecording} from '../model/recording';
import {DOCUMENT} from '@angular/common';

@Component({
  selector: 'laji-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss']
})
export class AudioViewerComponent implements AfterViewInit, OnChanges {
  @ViewChild('spectrogram', {static: true}) spectrogramRef: ElementRef<HTMLAudioElement>;
  @ViewChild('scrollLine', {static: true}) scrollLineRef: ElementRef<HTMLAudioElement>;
  @ViewChild('graph', {static: true}) graphRef: ElementRef<HTMLAudioElement>;
  @ViewChild('audioPlayer', {static: true}) playerRef: ElementRef<HTMLAudioElement>;

  @Input() recording: IRecording;

  isPlaying = false;

  private imageWidth = 500;
  private minX = 30;
  private maxX = 455;

  private onMouseMove = this.drag.bind(this);
  private onMouseUp  = this.endDrag.bind(this);
  private onButtonMouseUp = this.endInterval.bind(this);

  private interval;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateScrollLinePosition();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recording) {
      this.playerRef.nativeElement.load();
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScrollLinePosition();
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

  onAudioEnded() {
    this.isPlaying = false;
  }

  updateScrollLinePosition() {
    const currentTime = this.playerRef.nativeElement.currentTime;
    const duration = this.playerRef.nativeElement.duration;

    const shrink = this.spectrogramRef.nativeElement.offsetWidth / this.imageWidth;
    const minX = this.minX * shrink;
    const maxX = this.maxX * shrink;

    const position = (minX + (currentTime / (duration || 1)) * (maxX - minX)) + '';
    this.scrollLineRef.nativeElement.setAttribute('x1', position);
    this.scrollLineRef.nativeElement.setAttribute('x2', position);
  }

  startDrag(e) {
    e.preventDefault();
    this.playerRef.nativeElement.pause();
    this.document.addEventListener(
      'mousemove', this.onMouseMove
    );
    this.document.addEventListener(
      'mouseup', this.onMouseUp
    );
  }

  startInterval(e, forward = true) {
    e.preventDefault();
    this.playerRef.nativeElement.pause();

    this.interval = setInterval(() => {
      if (forward) {
        this.playerRef.nativeElement.currentTime += 0.5;
      } else {
        this.playerRef.nativeElement.currentTime -= 0.5;
      }

    }, 100);

    this.document.addEventListener(
      'mouseup', this.onButtonMouseUp
    );
  }

  private drag(e) {
    e.preventDefault();
    const duration = this.playerRef.nativeElement.duration;
    const shrink = this.spectrogramRef.nativeElement.offsetWidth / this.imageWidth;
    const minX = this.minX * shrink;
    const maxX = this.maxX * shrink;

    const xPos = this.getMousePosition(e, this.graphRef.nativeElement).x;
    const position = Math.min(Math.max(xPos, minX), maxX);
    const time = (position - minX) / (maxX - minX) * (duration || 1);
    this.playerRef.nativeElement.currentTime = time;
    this.cdr.detectChanges();
  }

  private endDrag() {
    this.document.removeEventListener(
      'mousemove', this.onMouseMove
    );
    this.document.removeEventListener(
      'mouseup', this.onMouseUp
    );
  }

  private getMousePosition(e, elem) {
    const CTM = elem.getScreenCTM();
    return {
      x: (e.clientX - CTM.e) / CTM.a - 1,
      y: (e.clientY - CTM.f) / CTM.d
    };
  }

  private endInterval() {
    clearInterval(this.interval);

    this.document.removeEventListener(
      'mouseup', this.onButtonMouseUp
    );
  }
}
