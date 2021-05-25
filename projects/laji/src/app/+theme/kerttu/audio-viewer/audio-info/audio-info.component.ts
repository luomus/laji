import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, Input } from '@angular/core';
import { IAudio } from '../../models';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'laji-audio-info',
  templateUrl: './audio-info.component.html',
  styleUrls: ['./audio-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioInfoComponent {
  @ViewChild('mapModal', { static: true }) mapModal: TemplateRef<any>;

  @Input() audio: IAudio;

  private modal: BsModalRef;

  constructor(
    private modalService: BsModalService
  ) { }

  openModal() {
    this.modal = this.modalService.show(this.mapModal, {class: 'modal-md'});
  }

  closeModal() {
    this.modal?.hide();
  }
}
