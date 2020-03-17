import { Component, OnInit, ViewChild, ElementRef, Input,
ChangeDetectorRef, ChangeDetectionStrategy, Renderer2, ViewContainerRef,
ComponentRef} from '@angular/core';
import { Audio } from 'app/shared/model/Audio';
import { Image } from 'app/shared/model/Image';
import * as saveAs from 'file-saver';
import { ModalDirective } from 'ngx-bootstrap';
import { AppendComponentService } from '../../shared/service/append-component.service';
import { AudioPlayerPopupComponent } from './audio-player-popup.component';
import { ComponentLoader, ComponentLoaderFactory } from 'ngx-bootstrap';


@Component({
  selector: 'laji-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  providers: [AppendComponentService],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AudioPlayerComponent implements OnInit {
   @Input() audioFiles: any;

  @ViewChild('popupSpectrumModal', { static: true }) modal: ModalDirective;
  @ViewChild('audio', {static: true}) audio: ElementRef;
  @ViewChild('audioPopUp', {static: false}) audioPopUp: ElementRef;
  public isPlaying: boolean[];
  public audioContainer: HTMLAudioElement;
  public audioContainerPopup: HTMLAudioElement;
  public nowplayingAudioId = -1;
  private currentVolume = 1;


  public listAudio: Audio[] = [];
  public playingAudio: Audio = {
    mp3URL: '',
    wavURL: '',
    thumbnailURL: '',
    copyrightOwner: '',
    author: '',
    fullURL: '',
    licenseId: '',
    mediaType: '',
  };
  public images: Image [] = [];
  public PopupSpectrum = false;
  public overlay: ComponentRef<AudioPlayerPopupComponent>;
  private _overlay: ComponentLoader<AudioPlayerPopupComponent>;
  public audioFile: Audio;
  public loading = false;

  constructor(
    private cd: ChangeDetectorRef,
    private append: AppendComponentService,
    _viewContainerRef: ViewContainerRef,
    _renderer: Renderer2,
    _elementRef: ElementRef,
    cis: ComponentLoaderFactory
  ) {
    this._overlay = cis
    .createLoader<AudioPlayerPopupComponent>(_elementRef, _viewContainerRef, _renderer);
  }

  ngOnInit(): void {
    this.nowplayingAudioId = -1;
    this.listAudio = this.audioFiles.filter(audio => audio['mediaType'] === 'AUDIO' );

    this.listAudio.forEach((element, index) =>
       this.images.push({ 'id': 'a' + index, 'fullURL': element.fullURL , 'thumbnailURL': element.thumbnailURL, 'intellectualRights': element.licenseId })
    );

    this.isPlaying = [...Array(this.listAudio.length)].fill(false);

    this.audioContainer = this.audio.nativeElement;
  }

  audioPlay(index, player): void {

    this.playingAudio = this.listAudio[index];
    this.nowplayingAudioId = index;

    if (this.isPlaying[index]) {
      this.audioPause(index, player);
      return;
    }

    this.isPlaying = [...Array(this.listAudio.length)].fill(false);
    this.isPlaying[index] = true;
    setTimeout(() => {
      player.play();
    });
    this.cd.detectChanges();
  }

  setInfoAudio(index: number = 0): void {
    this.nowplayingAudioId = index;
    this.playingAudio = this.listAudio[index];
    this.images = [];
    this.images.push({ 'id': 'a' + index , 'fullURL': this.listAudio[index].fullURL ,
    'thumbnailURL': this.listAudio[index].thumbnailURL, 'intellectualRights': this.listAudio[index].licenseId });
  }


  audioPause(index, player): void {
    this.isPlaying[index] = false;
    this.cd.detectChanges();
    player.pause();
  }

  nextAudio(index): void {
    this.audioPause(index - 1, this.audioContainerPopup);
    if (this.nowplayingAudioId < this.listAudio.length) {
      this.nowplayingAudioId = index;
      this.playingAudio = this.listAudio[index];
      this.cd.detectChanges();
    } else {
      this.setInfoAudio();
    }
  }

  previousAudio(index): void {
    this.audioPause(index + 1, this.audioContainerPopup);
    if (this.nowplayingAudioId > 0) {
      this.nowplayingAudioId = index;
      this.playingAudio = this.listAudio[index];
      this.cd.detectChanges();
    } else {
      this.setInfoAudio();
    }
  }

  onAudioEnded(index) {
    this.isPlaying[index] = false;
  }

  openSpectrumPopup(index, oldPlayer) {
    // this.append.appendComponentToBody(AudioPlayerPopupComponent);
    this._overlay
      .attach(AudioPlayerPopupComponent)
      .to('body')
      .show({isAnimated: false});
      this.PopupSpectrum = true;
    this.overlay = this._overlay._componentRef;
    this.overlay.instance.listAudio = this.listAudio;
    this.overlay.instance.openAudioPopup(index);
    this.overlay.instance.close = () => {
      this.onHidePopupSpectrum();
    };
    if (this.nowplayingAudioId !== -1 || this.nowplayingAudioId === undefined) {
      this.audioPause(this.nowplayingAudioId, oldPlayer);
    }
    // this.modal.show();
    this.cd.detectChanges();
    this.startPopupPlayer(index);
  }

  startPopupPlayer(index) {
    this.playingAudio = this.listAudio[index];
    this.audioContainerPopup = this.audioPopUp.nativeElement;
    this.audioPlay(index, this.audioContainerPopup);
  }

  onHidePopupSpectrum() {
    this.PopupSpectrum = false;
    this._overlay.hide();
    this.cd.detectChanges();
    this.audioPause(this.nowplayingAudioId, this.audioContainerPopup);
  }


}
