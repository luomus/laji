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

  speciesAnnotationEnum = SpeciesAnnotationEnum;
  hideInside = true;

  @Output() deleteClick = new EventEmitter();
  @Output() annotationTypeChange = new EventEmitter<SpeciesAnnotationEnum>();
  @Output() toggleDrawClick = new EventEmitter();

  onDeleteClick(e: Event) {
    this.deleteClick.emit();
    this.stopPropagation(e);
  }

  stopPropagation(e: Event) {
    e.stopPropagation();
  }
}
