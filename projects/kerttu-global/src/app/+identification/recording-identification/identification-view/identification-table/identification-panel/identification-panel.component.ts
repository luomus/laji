import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { IGlobalRecording, IGlobalSpeciesWithAnnotation, SpeciesAnnotationEnum } from '../../../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-identification-panel',
  templateUrl: './identification-panel.component.html',
  styleUrls: ['./identification-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationPanelComponent {
  @Input() recording: IGlobalRecording;
  @Input() identification: IGlobalSpeciesWithAnnotation;
  @Input() buttonsDisabled = false;
  @Input() drawActive = false;
  @Input() open = true;
  @Input() componentId = '';
  @Input() birdRectangleColor = 'white';
  @Input() overlappingBirdRectangleColor = 'orange';

  speciesAnnotationEnum = SpeciesAnnotationEnum;
  hideInside = true;

  @Output() identificationChange = new EventEmitter<IGlobalSpeciesWithAnnotation>();
  @Output() deleteClick = new EventEmitter();
  @Output() toggleDrawClick = new EventEmitter();
  @Output() deleteBoxClick = new EventEmitter<number>();
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
}
