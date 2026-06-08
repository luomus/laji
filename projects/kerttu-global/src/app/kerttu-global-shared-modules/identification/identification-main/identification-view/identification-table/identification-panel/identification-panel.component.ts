import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  SimpleChanges,
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
import { getBoxLabel } from '../../../../../../kerttu-global-shared/service/kerttu-global-utils';
import { SoundTypeService } from '../../../../../../kerttu-global-shared/service/sound-type.service';
import { SpectrogramConfig } from '../../../../../../../../../laji/src/app/shared-modules/audio-viewer/models';
import { Observable, ReplaySubject, switchMap } from 'rxjs';

interface BoxClickEvent {
  idx: number;
  groupIdx?: number;
}

@Component({
    selector: 'bsg-identification-panel',
    templateUrl: './identification-panel.component.html',
    styleUrls: ['./identification-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class IdentificationPanelComponent implements OnChanges {
  @ViewChild('toggleDrawBtn', { static: false }) toggleDrawBtn?: ElementRef;
  @ViewChildren('toggleDrawRelatedBtn') toggleDrawRelatedBtn!: QueryList<ElementRef>;

  @Input() componentId = '';
  @Input() speciesIdx?: number;

  @Input({ required: true }) recording!: IGlobalRecording;
  @Input({ required: true }) identification!: IGlobalSpeciesWithAnnotation;

  @Input() showOverlapsWithOtherSpeciesCheck = true;
  @Input() showDrawRelatedBoxBtn = true;
  @Input() buttonsDisabled = false;
  @Input() drawBoxActive = false;
  @Input() drawRelatedBoxActive: boolean[] = [];
  @Input() open = true;

  @Input() birdRectangleColor = 'white';
  @Input() overlappingBirdRectangleColor = 'orange';

  @Input({ required: true }) sampleRate!: number;
  @Input({ required: true }) spectrogramConfig!: SpectrogramConfig;

  soundTypes$: Observable<string[]>;

  speciesAnnotationEnum = SpeciesAnnotationEnum;
  taxonTypeEnum = TaxonTypeEnum;

  private taxonType$ = new ReplaySubject<TaxonTypeEnum>(1);

  isBoxGroup = isBoxGroup;
  getBoxLabel = getBoxLabel;

  constructor(
    private soundTypeService: SoundTypeService
  ) {
    this.soundTypes$ = this.taxonType$.pipe(
      switchMap(taxonType => this.soundTypeService.getSoundTypes(taxonType))
    );
  }

  @Output() identificationChange = new EventEmitter<IGlobalSpeciesWithAnnotation>();
  @Output() deleteClick = new EventEmitter();
  @Output() drawBoxClick = new EventEmitter();
  @Output() drawRelatedBoxClick = new EventEmitter<BoxClickEvent>();
  @Output() deleteBoxClick = new EventEmitter<BoxClickEvent>();
  @Output() openChange = new EventEmitter<boolean>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.identification) {
      this.taxonType$.next(this.identification.taxonType);
    }
  }

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
