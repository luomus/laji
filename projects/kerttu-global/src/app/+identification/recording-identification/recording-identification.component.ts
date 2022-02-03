import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import {IGlobalSpecies, IRecordingAnnotation, ISpeciesIdentification, SpeciesAnnotationEnum} from '../../kerttu-global-shared/models';
import { IAudioViewerArea, IAudioViewerRectangle } from '../../../../../laji/src/app/shared-modules/audio-viewer/models';

@Component({
  selector: 'bsg-recording-identification',
  templateUrl: './recording-identification.component.html',
  styleUrls: ['./recording-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingIdentificationComponent {
  recording = {
    audio: {
      url: 'https://image.laji.fi/cornell239808151/239808151_00.mp3'
    },
    xRange: [2, 12]
  };
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
