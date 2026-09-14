import { Component, OnInit, ViewChild, ElementRef, Input,
ChangeDetectorRef, ChangeDetectionStrategy, TemplateRef, HostListener } from '@angular/core';
import { DocumentViewerChildComunicationService } from '../document-viewer/document-viewer-child-comunication.service';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';
import { components } from 'projects/laji-api-client/generated/api';

type Media = components['schemas']['WarehouseDwETL_MediaObject'];

@Component({
    selector: 'laji-audio-player',
    templateUrl: './audio-player.component.html',
    styleUrls: ['./audio-player.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class AudioPlayerComponent implements OnInit {
   @Input() audioFiles: Media[] = [];

  @ViewChild('modalSpectrum', { static: true }) modalSpectrum!: TemplateRef<any>;
  @ViewChild('audio', {static: true}) audio!: ElementRef;

  public isPlaying!: boolean[];
  public nowplayingAudioId = -1;
  public listAudio: Media[] = [];
  public playingAudio?: Media;

  private audioContainer!: HTMLAudioElement;
  private modalRef?: ModalRef;

  constructor(
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private childComunication: DocumentViewerChildComunicationService
  ) {}

  ngOnInit(): void {
    this.nowplayingAudioId = 0;
    this.listAudio = this.audioFiles.filter(audio => audio.mediaType === 'AUDIO');

    this.isPlaying = [...Array(this.listAudio.length)].fill(false);
    this.playingAudio = this.listAudio[this.nowplayingAudioId];
    this.audioContainer = this.audio.nativeElement;
    this.audioContainer.preload = 'auto';
  }

  audioPlay(index: number): void {
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
  }

  audioPause(index: number): void {
    this.isPlaying[index] = false;
    this.audioContainer.pause();
  }

  nextAudio(index: number): void {
    this.cd.markForCheck();
    if (this.nowplayingAudioId < this.listAudio.length) {
      this.nowplayingAudioId = index;
      this.playingAudio = this.listAudio[index];
    } else {
      this.setInfoAudio();
    }
  }

  previousAudio(index: number): void {
    this.cd.markForCheck();
    if (this.nowplayingAudioId > 0) {
      this.nowplayingAudioId = index;
      this.playingAudio = this.listAudio[index];
    } else {
      this.setInfoAudio();
    }
  }

  onAudioEnded(index: number) {
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

  openSpectrumPopup(index: number) {
    this.cd.detectChanges();
    this.openModal();
    if (this.nowplayingAudioId !== -1 || this.nowplayingAudioId === undefined) {
      this.audioPause(this.nowplayingAudioId);
      this.nowplayingAudioId = index;
    } else {
      this.nowplayingAudioId = index;
    }
    this.childComunication.emitChildEvent(true);
    this.startPopupPlayer(index);
  }

  startPopupPlayer(index: number) {
    this.playingAudio = this.listAudio[index];
  }

  @HostListener('document:keydown', ['$event'])
  annotationKeyDown(e: KeyboardEvent) {
    if (e.keyCode === 27) {
      e.stopImmediatePropagation();
       this.closeModal();
      }

  }
}
