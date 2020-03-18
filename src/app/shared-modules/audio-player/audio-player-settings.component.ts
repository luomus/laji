import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'laji-observation-table-settings',
  template: `
    <ng-template #popupSpectrum>
    <div class="modal-header">
        <!--<button (click)="saveFile()" class="save"><i class="glyphicon glyphicon glyphicon-save"></i></button>-->
        <button type="button" class="close" (click)="popupSpectrumModal.hide()">
        <i class="glyphicon glyphicon-remove"></i>
        </button>
        <ul class="pager">
        <li class="previous">
            <a role="button" (click)="previousAudio(nowplayingAudioId - 1)" class="play"
            *ngIf="nowplayingAudioId > 0 && listAudio.length > 1">← {{ 'paginator.previous' | translate }}</a>
        </li>
        <li class="next">
            <a role="button" (click)="nextAudio(nowplayingAudioId + 1)" class="play"
            *ngIf="(nowplayingAudioId < listAudio.length-1) && listAudio.length > 1">{{ 'paginator.next' | translate }} →</a>
        </li>
        </ul>
    </div>
    <div class="modal-body">
        <img src="{{playingAudio.fullURL}}" />
        <div id="audioControls">
        <audio #audioPopUp controls="controls" class="music-player__audio-container" style="width: 100%;"
        (ended)="onAudioEnded(nowplayingAudioId)" [src]="playingAudio.mp3URL">
            <source data-src="{{playingAudio.mp3URL}}" type="audio/mpeg">
        </audio>
        </div>
    </div>
    </ng-template>
  `
})
export class AudioPlayerSettingsComponent {


  @ViewChild('popupSpectrum', { static: true }) popupSpectrum: TemplateRef<any>;

  @Input() listAudio: any[];
  @Input() currentAudioIndex: number;
  @Input() audioFile: any;


  @Output() close = new EventEmitter<boolean>();

  private modal: BsModalRef;
  private response = false;

  constructor(
    private modalService: BsModalService
  ) { }


  openModal() {
    this.response = false;
    this.modal = this.modalService.show(this.popupSpectrum, {class: 'modal-lg'});
    this.modalService.onHide.pipe(take(1)).subscribe(() => {
      this.close.emit(this.response);
    });
  }

  closeModal(ok = false) {
    if (this.modal) {
      this.response = ok;
      this.modal.hide();
    }
  }

}
