import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef, ViewChildren, QueryList
} from '@angular/core';
import {
  IGlobalRecording,
  IGlobalSpeciesWithAnnotation,
  isBoxGroup,
  SpeciesAnnotationEnum,
  TaxonTypeEnum
} from '../../../../../../kerttu-global-shared/models';
import { KerttuGlobalUtil } from '../../../../../../kerttu-global-shared/service/kerttu-global-util.service';
import { ISpectrogramConfig } from '../../../../../../../../../laji/src/app/shared-modules/audio-viewer/models';

interface BoxClickEvent {
  idx: number;
  groupIdx?: number;
}

@Component({
  selector: 'bsg-identification-panel',
  templateUrl: './identification-panel.component.html',
  styleUrls: ['./identification-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationPanelComponent {
  @ViewChild('toggleDrawBtn', { static: false }) toggleDrawBtn?: ElementRef;
  @ViewChildren('toggleDrawRelatedBtn') toggleDrawRelatedBtn!: QueryList<ElementRef>;

  @Input() componentId = '';
  @Input() speciesIdx?: number;

  @Input({ required: true }) recording!: IGlobalRecording;
  @Input({ required: true }) identification!: IGlobalSpeciesWithAnnotation;

  @Input() showDrawRelatedBoxBtn = true;
  @Input() buttonsDisabled = false;
  @Input() drawBoxActive = false;
  @Input() drawRelatedBoxActive: boolean[] = [];
  @Input() open = true;

  @Input() birdRectangleColor = 'white';
  @Input() overlappingBirdRectangleColor = 'orange';
  @Input({ required: true }) spectrogramConfig!: ISpectrogramConfig;

  speciesAnnotationEnum = SpeciesAnnotationEnum;
  taxonTypeEnum = TaxonTypeEnum;

  isBoxGroup = isBoxGroup;
  getBoxLabel = KerttuGlobalUtil.getBoxLabel;

  @Output() identificationChange = new EventEmitter<IGlobalSpeciesWithAnnotation>();
  @Output() deleteClick = new EventEmitter();
  @Output() drawBoxClick = new EventEmitter();
  @Output() drawRelatedBoxClick = new EventEmitter<BoxClickEvent>();
  @Output() deleteBoxClick = new EventEmitter<BoxClickEvent>();
  @Output() openChange = new EventEmitter<boolean>();

  annotationTypeChange(value: number) {
    this.identification.annotation.occurrence = value;
    this.identificationChange.emit(this.identification);
  }

  onDeleteClick(e: Event) {
    this.deleteClick.emit();
    this.stopPropagation(e);
  }

  stopPropagation(e: Event) {
    e.stopPropagation();
  }

  scrollDrawButtonIntoView(boxIndex?: number) {
    const elem = boxIndex != null ? this.toggleDrawRelatedBtn.toArray()[boxIndex] : this.toggleDrawBtn;
    elem?.nativeElement.scrollIntoView({behavior: 'smooth'});
  }
}
