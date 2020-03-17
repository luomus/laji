import { Component, EventEmitter, HostListener, OnInit, Output, Input,
ViewChild, ElementRef, ChangeDetectionStrategy, OnChanges, AfterViewInit} from '@angular/core';

@Component({
  selector: 'laji-audio-player-popup',
  styleUrls: ['./audio-player.component.scss'],
  templateUrl: './audio-player-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioPlayerPopupComponent implements OnInit, AfterViewInit {
  public listAudio: any[];
  public currentAudioIndex: number;
  public audioFile: any;
  public close: Function;
  public play: Function;
  public loading;
  public audioplayer: ElementRef<any>;

  @ViewChild('audioPopUp', {static: false}) audioPopUp: ElementRef;
  public audioContainerPopup: HTMLAudioElement;


  constructor(element: ElementRef) {

}

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  ngOnChange() {
    this.audioContainerPopup = this.audioPopUp.nativeElement;
    console.log(this.audioContainerPopup);
  }

  openAudioPopup(index) {
    if (!index) {
      this.currentAudioIndex = -1;
    }
    this.currentAudioIndex = index;
    if (this.listAudio[index]) {
      this.audioFile = this.listAudio[index];
    }
  }

  playAudio() {
    this.play();
  }

  closePopup() {
    if (this.close) {
      this.close();
    }
  }


  handleLoading(loading) {
    setTimeout(() => {
      this.loading = loading;
    }, 200);
  }

}
