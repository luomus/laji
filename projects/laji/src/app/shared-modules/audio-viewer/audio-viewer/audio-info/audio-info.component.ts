import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, Input } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IAudio } from 'projects/laji/src/app/+theme/kerttu/models';

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
