import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AudioViewerMode, IAudioViewerArea, ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { DialogService } from 'projects/laji/src/app/shared/service/dialog.service';
import { IGlobalAudio, IKerttuLetterTemplate } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-letter-template',
  templateUrl: './letter-template.component.html',
  styleUrls: ['./letter-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LetterTemplateComponent {
  @Input() template: IKerttuLetterTemplate;
  @Input() audio: IGlobalAudio;
  @Input() spectrogramConfig: ISpectrogramConfig;
  @Input() templateIdx: number;
  @Input() isNew: boolean;
  @Input() focusTime: number;
  @Input() requireComment = false;

  @Output() confirm = new EventEmitter<{template: IKerttuLetterTemplate, comment?: string}>();
  @Output() cancel = new EventEmitter();
  @Output() remove = new EventEmitter<{comment?: string}>();

  audioViewerMode: AudioViewerMode = 'default';
  defaultZoomFrequency = true;
  zoomFrequency = this.defaultZoomFrequency;
  defaultTimePadding = 30;
  timePadding = this.defaultTimePadding;

  comment = '';

  @ViewChild('commentModal', { static: true }) commentModal: TemplateRef<any>;

  private areaChanged = false;
  private operationAfterComment: 'confirm'|'remove' = 'confirm';

  private modalRef: BsModalRef;

  constructor(
    private dialogService: DialogService,
    private modalService: BsModalService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleDrawMode() {
    this.audioViewerMode = this.audioViewerMode === 'draw' ? 'default' : 'draw';
  }

  onDrawEnd(area: IAudioViewerArea) {
    if (!this.template) {
      this.template = {
        audioId: this.audio.id,
        area: area
      };
    } else {
      this.template.area = area;
    }
    this.areaChanged = true;
    this.audioViewerMode = 'default';
  }

  onConfirm() {
    if (this.requireComment && this.areaChanged) {
      this.operationAfterComment = 'confirm';
      this.showCommentModal();
    } else {
      this.confirmTemplate(this.template);
    }
  }

  onRemove() {
    if (this.requireComment) {
      this.operationAfterComment = 'remove';
      this.showCommentModal();
    } else {
      this.dialogService.confirm('validation.templates.remove.confirm').subscribe(confirm => {
        if (confirm) {
          this.removeTemplate();
          this.cdr.markForCheck();
        }
      });
    }
  }

  confirmOrRemoveWithComment() {
    this.hideCommentModal();

    if (this.operationAfterComment === 'confirm') {
      this.confirmTemplate(this.template, this.comment);
    } else {
      this.removeTemplate(this.comment);
    }
  }

  confirmTemplate(template: IKerttuLetterTemplate, comment?: string) {
    this.confirm.emit({template, comment});
  }

  removeTemplate(comment?: string) {
    this.remove.emit({comment});
  }

  showCommentModal() {
    this.modalRef = this.modalService.show(this.commentModal, {class: 'modal-md'});
  }

  hideCommentModal() {
    this.modalRef.hide();
  }
}
