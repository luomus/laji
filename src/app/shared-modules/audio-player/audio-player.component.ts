import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Audio } from 'app/shared/model/Audio';
import { Image } from 'app/shared/model/Image';
import * as saveAs from 'file-saver';

@Component({
  selector: 'laji-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})

export class AudioPlayerComponent implements OnInit {
   @Input() audioFiles: any;


  @ViewChild('progressBar', {static: true}) progress: ElementRef;
  @ViewChild('progressBarStatus', {static: true}) progressStatus: ElementRef;

  @ViewChild('volumeBar', {static: true}) volume: ElementRef;
  @ViewChild('volumeStatus', {static: true}) volumeStatus: ElementRef;
  private volumeBar: HTMLElement;
  private volumeStatusBar: HTMLElement;

  @ViewChild('audio', {static: true}) audio: ElementRef;
  private isPlaying = false;
  private audioContainer: HTMLAudioElement;
  private nowplayingAudioId: number;
  private currentVolume = 1;


  private listAudio: Audio[];
  public playingAudio: Audio;
  public images: Image [] = [];

  constructor() {}

  ngOnInit(): void {


    this.listAudio = this.audioFiles.filter(audio => audio['mediaType'] === 'AUDIO' );

    this.listAudio.forEach((element, index) =>
       this.images.push({ 'id': 'a' + index, 'fullURL': element.fullURL , 'thumbnailURL': element.thumbnailURL, 'intellectualRights': element.licenseId })
    );

    this.volumeBar = this.volume.nativeElement;
    this.volumeStatusBar = this.volumeStatus.nativeElement;

    this.audioContainer = this.audio.nativeElement;
    this.setInfoAudio();
  }

  audioPlay(): void {
    if (this.isPlaying) {
      this.audioPause();
      return;
    }

    this.isPlaying = true;
    setTimeout(() => {
      this.audioContainer.play();
    });
  }

  setInfoAudio(index: number = 0): void {
    this.nowplayingAudioId = index;
    this.playingAudio = this.listAudio[index];
    this.images = [];
    this.images.push({ 'id': 'a' + index , 'fullURL': this.listAudio[index].fullURL ,
    'thumbnailURL': this.listAudio[index].thumbnailURL, 'intellectualRights': this.listAudio[index].licenseId });
  }


  audioPause(): void {
    this.audioContainer.pause();
    this.isPlaying = false;
  }


  audioMute(): void {
    if (this.audioContainer.volume) {
      this.setVolume(0);
      this.changeVolumeBarStatus(0);
    } else {
      this.setVolume(this.currentVolume);
      this.changeVolumeBarStatus(this.currentVolume * 100);
    }
  }

  setVolume(volume: number): void {
    this.audioContainer.volume = volume;
  }

  setCurrentVolume(volume: number): void {
    this.currentVolume = volume;
  }

  changeVolumeBarStatus(persentage: number): void {
    this.volumeStatusBar.style.width = `${persentage}%`;
  }

  changeAudioVolume(event: MouseEvent): void {
    const volumeBarProperty = this.volumeBar.getBoundingClientRect();
    const mousePosition = event.pageX - volumeBarProperty.left + pageXOffset;
    const volumePersentage = mousePosition * 100 / volumeBarProperty.width;
    this.changeVolumeBarStatus(volumePersentage);
    this.setCurrentVolume(volumePersentage / 100);
    this.setVolume(this.currentVolume);
  }

  nextAudio(): void {
    this.audioPause();
    if (this.nowplayingAudioId < this.listAudio.length) {
      this.setInfoAudio(++this.nowplayingAudioId);
    } else {
      this.setInfoAudio();
    }
  }

  previousAudio(): void {
    this.audioPlay();
    if (this.nowplayingAudioId > 0) {
      this.setInfoAudio(--this.nowplayingAudioId);
    } else {
      this.setInfoAudio();
    }
  }

  saveFile() {
    saveAs(new Blob([this.playingAudio.mp3URL], { type: 'mp3' }), 'audio.mp3');
  }

}
