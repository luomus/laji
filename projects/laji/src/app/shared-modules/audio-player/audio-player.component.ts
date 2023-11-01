import { Component, OnInit, ViewChild, ElementRef, Input,
ChangeDetectorRef, ChangeDetectionStrategy, TemplateRef, HostListener } from '@angular/core';
import { DocumentViewerChildComunicationService } from '../document-viewer/document-viewer-child-comunication.service';
import { Audio } from '../../shared/model/Audio';
import { Image } from '../../shared/model/Image';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';

@Component({
  selector: 'laji-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AudioPlayerComponent implements OnInit {
   @Input() audioFiles: any;

  @ViewChild('modalSpectrum', { static: true }) modalSpectrum: TemplateRef<any>;
  @ViewChild('audio', {static: true}) audio: ElementRef;
  @ViewChild('audioPopUp', {static: true}) audioPopUp: ElementRef;
  public isPlaying: boolean[];
  public audioContainer: HTMLAudioElement;
  public audioContainerPopup: HTMLAudioElement;
  public nowplayingAudioId = -1;


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
  public popupSpectrum = false;
  public audioFile: Audio;

  private modalRef: ModalRef;

  constructor(
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private childComunication: DocumentViewerChildComunicationService
  ) {}

  ngOnInit(): void {
    this.nowplayingAudioId = 0;
    this.listAudio = this.audioFiles.filter(audio => audio['mediaType'] === 'AUDIO' );

    this.listAudio.forEach((element, index) =>
       this.images.push({ id: 'a' + index, fullURL: element.fullURL , thumbnailURL: element.thumbnailURL, intellectualRights: element.licenseId })
    );

    this.isPlaying = [...Array(this.listAudio.length)].fill(false);
    this.playingAudio = this.listAudio[this.nowplayingAudioId];
    this.audioContainer = this.audio.nativeElement;
    this.audioContainer.preload = 'auto';
  }

  audioPlay(index): void {
    this.playingAudio = this.listAudio[index];
    this.nowplayingAudioId = index;

    if (this.isPlaying[index]) {
      this.audioPause(index);
      return;
    }

    this.isPlaying = [...Array(this.listAudio.length)].fill(false);
    this.isPlaying[index] = true;
    setTimeout(() => {
      this.audioContainer.play();
    });
  }

  setInfoAudio(index: number = 0): void {
    this.nowplayingAudioId = index;
    this.playingAudio = this.listAudio[index];
    this.images = [];
    this.images.push({ id: 'a' + index , fullURL: this.listAudio[index].fullURL ,
    thumbnailURL: this.listAudio[index].thumbnailURL, intellectualRights: this.listAudio[index].licenseId });
  }


  audioPause(index): void {
    this.isPlaying[index] = false;
    this.audioContainer.pause();
  }

  nextAudio(index): void {
    this.cd.markForCheck();
    if (this.nowplayingAudioId < this.listAudio.length) {
      this.nowplayingAudioId = index;
      this.playingAudio = this.listAudio[index];
    } else {
      this.setInfoAudio();
    }
  }

  previousAudio(index): void {
    this.cd.markForCheck();
    if (this.nowplayingAudioId > 0) {
      this.nowplayingAudioId = index;
      this.playingAudio = this.listAudio[index];
    } else {
      this.setInfoAudio();
    }
  }

  onAudioEnded(index) {
    this.isPlaying[index] = false;
  }

  openModal() {
    this.modalRef = this.modalService.show(this.modalSpectrum, {size: 'lg'});
    this.cd.markForCheck();
  }

  closeModal() {
    if (this.modalRef) {
      this.childComunication.emitChildEvent(false);
      this.modalRef.hide();
    }
  }


  openSpectrumPopup(index) {
    this.cd.detectChanges();
    this.openModal();
    if (this.nowplayingAudioId !== -1 || this.nowplayingAudioId === undefined) {
      this.audioPause(this.nowplayingAudioId);
      this.nowplayingAudioId = index;
    } else {
      this.nowplayingAudioId = index;
    }
    this.popupSpectrum = true;
    this.childComunication.emitChildEvent(true);
    this.startPopupPlayer(index);
  }

  startPopupPlayer(index) {
    this.playingAudio = this.listAudio[index];
  }

  onHidePopupSpectrum() {
    this.popupSpectrum = false;
    this.childComunication.emitChildEvent(false);
    this.cd.detectChanges();
    this.audioPause(this.nowplayingAudioId);
  }


  @HostListener('document:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {
    if (e.keyCode === 27) {
      e.stopImmediatePropagation();
       this.closeModal();
      }

  }


}
