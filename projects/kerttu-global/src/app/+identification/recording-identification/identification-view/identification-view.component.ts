import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { IGlobalSpecies, IRecordingAnnotation, ISpeciesIdentification, SpeciesAnnotationEnum } from '../../../kerttu-global-shared/models';
import { IAudio, IAudioViewerArea, IAudioViewerRectangle } from '../../../../../../laji/src/app/shared-modules/audio-viewer/models';

@Component({
  selector: 'bsg-identification-view',
  templateUrl: './identification-view.component.html',
  styleUrls: ['./identification-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationViewComponent {
  @Input() recording: IAudio;

  hasPreviousRecording = false;
  buttonsAreDisabled = false;

  annotation: IRecordingAnnotation = {
    identifications: []
  };

  drawMode = false;
  drawIdx?: number;
  rectangles: IAudioViewerRectangle[] = [];

  @Output() nextRecordingClick = new EventEmitter();
  @Output() previousRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter();
  @Output() annotationChange = new EventEmitter<ISpeciesIdentification[]>();

  addToIdentifications(species: IGlobalSpecies) {
    this.annotation.identifications = [
      ...this.annotation.identifications,
      {species: species, occurrence: SpeciesAnnotationEnum.occurs}
    ];
  }

  onDrawClick(data: {drawClicked: boolean, rowIndex: number}) {
    this.drawMode = data.drawClicked;
    this.drawIdx = data.rowIndex;
  }

  drawEnd(area: IAudioViewerArea) {
    const identifications = this.annotation.identifications;
    const label = identifications[this.drawIdx].species.commonName;
    this.rectangles = this.rectangles.filter(r => r.label !== label);
    this.rectangles = [...this.rectangles, {area: area, label: label}];

    identifications[this.drawIdx].area = area;
    this.annotation.identifications = [...identifications];
    this.drawMode = false;
  }

  removeDrawing(rowIndex: number) {
    const identifications = this.annotation.identifications;
    const label = identifications[rowIndex].species.commonName;
    this.rectangles = this.rectangles.filter(r => r.label !== label);

    identifications[this.drawIdx].area = null;
    this.annotation.identifications = [...identifications];
  }

  updateAnnotation() {

  }
}
