import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DialogService } from 'projects/laji/src/app/shared/service/dialog.service';
import { AudioViewerMode, IAudioViewerArea, ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { CommentType, IGlobalAudio, IGlobalComment, IGlobalTemplate } from '../../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateComponent {
  @Input() template?: IGlobalTemplate;
  @Input() templateIdx?: number;
  @Input() isNewTemplate?: boolean;
  @Input() audio?: IGlobalAudio;
  @Input() audioFocusTime?: number;
  @Input() spectrogramConfig?: ISpectrogramConfig;
  @Input() historyView?: boolean;

  @Output() confirm = new EventEmitter<IGlobalTemplate>();
  @Output() cancel = new EventEmitter();
  @Output() remove = new EventEmitter();
  @Output() comment = new EventEmitter<IGlobalComment>();

  audioViewerMode: AudioViewerMode = 'default';
  defaultZoomFrequency = false;
  zoomFrequency = this.defaultZoomFrequency;
  defaultTimePadding = 30;
  timePadding = this.defaultTimePadding;

  commentText = '';
  commentTypeEnum = CommentType;

  @ViewChild('commentModal', { static: true }) commentModal: TemplateRef<any>;
  @ViewChild('audioInfo', { static: true }) audioInfoTpl: TemplateRef<any>;

  private framedTemplate?: IGlobalTemplate;
  private commentType: CommentType = CommentType.reframe;
  private modalRef?: BsModalRef;

  constructor(
    private dialogService: DialogService,
    private modalService: BsModalService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleDrawMode() {
    this.audioViewerMode = this.audioViewerMode === 'draw' ? 'default' : 'draw';
  }

  onDrawEnd(area: IAudioViewerArea) {
    this.audioViewerMode = 'default';
    this.framedTemplate = {
      audioId: this.audio.id,
      area: area
    };

    if (this.template?.id) {
      this.commentType = CommentType.reframe;
      this.showCommentModal();
    } else {
      this.template = this.framedTemplate;
    }
  }

  onConfirm() {
    this.confirm.emit(this.template);
  }

  onRemove() {
    if (this.template.id) {
      this.commentType = CommentType.replace;
      this.showCommentModal();
    } else {
      this.dialogService.confirm('validation.template.remove.confirm').subscribe(confirm => {
        if (confirm) {
          this.remove.emit();
          this.cdr.markForCheck();
        }
      });
    }
  }

  confirmComment() {
    this.hideCommentModal();

    this.comment.emit({
      templateId:  this.template.id,
      comment: this.commentText,
      type: this.commentType
    });

    if (this.commentType === CommentType.reframe) {
      this.template = this.framedTemplate;
    } else {
      this.remove.emit();
    }
  }

  showCommentModal() {
    this.modalRef = this.modalService.show(this.commentModal, { class: 'modal-md' });
  }

  hideCommentModal() {
    this.modalRef.hide();
  }
}
