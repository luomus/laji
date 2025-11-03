import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ModalRef, ModalService } from '../../../../../../../laji-ui/src/lib/modal/modal.service';
import { TaxonTypeEnum } from '../../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-identification-nav',
  templateUrl: './identification-nav.component.html',
  styleUrls: ['./identification-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationNavComponent {
  @ViewChild('filterModal', { static: true }) filterModal!: TemplateRef<any>;

  @Input() hasPreviousRecording = false;
  @Input() buttonsDisabled = false;
  @Input() saveDisabled = false;
  @Input() taxonType?: TaxonTypeEnum = TaxonTypeEnum.bird;
  @Input({ required: true }) goBackBtnLabel!: string;
  @Input() fileNameFilter = '';
  _fileNameFilter = '';

  taxonTypeEnum = TaxonTypeEnum;

  @Output() nextRecordingClick = new EventEmitter();
  @Output() previousRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter();
  @Output() skipClick = new EventEmitter();
  @Output() goBackClick = new EventEmitter();
  @Output() fileNameFilterChange = new EventEmitter<string>();

  private filterModalRef?: ModalRef<any>;

  constructor(
    private modalService: ModalService
  ) {}

  onFilterButtonClick() {
    this._fileNameFilter = this.fileNameFilter;
    this.filterModalRef = this.modalService.show(this.filterModal, { size: 'md' });
  }

  onFilterModalOkButtonClick() {
    if (this._fileNameFilter !== this.fileNameFilter) {
      this.fileNameFilter = this._fileNameFilter;
      this.fileNameFilterChange.emit(this.fileNameFilter);
    }
    this.filterModalRef!.hide();
  }
}
