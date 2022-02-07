import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import {
  IGlobalSpecies,
  IGlobalRecordingAnnotation,
  IGlobalSpeciesAnnotation,
  SpeciesAnnotationEnum,
  IGlobalRecording, IGlobalSpeciesWithAnnotation, IGlobalRecordingStatusInfo
} from '../../../kerttu-global-shared/models';
import { IAudioViewerArea, IAudioViewerRectangle } from '../../../../../../laji/src/app/shared-modules/audio-viewer/models';
import { map } from 'rxjs/operators';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { Observable, Subscription, forkJoin } from 'rxjs';


@Component({
  selector: 'bsg-identification-view',
  templateUrl: './identification-view.component.html',
  styleUrls: ['./identification-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationViewComponent implements OnChanges {
  @Input() recording: IGlobalRecording;
  @Input() annotation: IGlobalRecordingAnnotation;
  @Input() statusInfo: IGlobalRecordingStatusInfo;
  @Input() buttonsAreDisabled = false;

  selectedSpecies: IGlobalSpeciesWithAnnotation[] = [];

  loadingSpecies = false;
  drawMode = false;
  drawIdx?: number;
  rectangles: IAudioViewerRectangle[] = [];

  @Output() nextRecordingClick = new EventEmitter();
  @Output() previousRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter();
  @Output() annotationChange = new EventEmitter<IGlobalRecordingAnnotation>();

  private selectedSpeciesSub: Subscription;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.annotation) {
      this.rectangles = [];
      this.updateSelectecSpecies();
    }
  }

  addToIdentifications(species: IGlobalSpecies) {
    if (this.loadingSpecies) {
      return;
    }
    if (this.selectedSpecies.filter(t => t.annotation.speciesId === species.id).length > 0) {
      return;
    }

    const newSpecies: IGlobalSpeciesWithAnnotation = {
      ...species,
      annotation: {
        speciesId: species.id,
        occurrence: SpeciesAnnotationEnum.occurs
      }
    };

    this.selectedSpecies = [...this.selectedSpecies, newSpecies];

    this.updateAnnotation();
  }

  onDrawClick(data: {drawClicked: boolean, rowIndex: number}) {
    this.drawMode = data.drawClicked;
    this.drawIdx = data.rowIndex;
  }

  drawEnd(area: IAudioViewerArea) {
    const label = this.selectedSpecies[this.drawIdx].commonName;
    this.rectangles = this.rectangles.filter(r => r.label !== label);
    this.rectangles = [...this.rectangles, {area: area, label: label}];

    this.selectedSpecies[this.drawIdx].annotation.area = area;
    this.selectedSpecies = [...this.selectedSpecies];
    this.drawMode = false;
  }

  removeDrawing(rowIndex: number) {
    const label = this.selectedSpecies[rowIndex].commonName;
    this.rectangles = this.rectangles.filter(r => r.label !== label);

    this.selectedSpecies[rowIndex].annotation.area = null;
    this.selectedSpecies = [...this.selectedSpecies];
  }

  updateAnnotation() {
    const speciesAnnotations: IGlobalSpeciesAnnotation[] = this.selectedSpecies.map(species => species.annotation);

    this.annotationChange.emit({
      ...this.annotation,
      speciesAnnotations: speciesAnnotations
    });
  }

  private updateSelectecSpecies() {
    if (this.selectedSpeciesSub) {
      this.selectedSpeciesSub = undefined;
    }

    this.selectedSpecies = [];

    const speciesAnnotations = this.annotation?.speciesAnnotations;

    if (speciesAnnotations?.length > 0) {
      const observables: Observable<IGlobalSpeciesWithAnnotation>[] = speciesAnnotations.map(
        a => this.kerttuGlobalApi.getSpecies(a.speciesId).pipe(map(species => {
          return {...species, annotation: a};
        }))
      );

      this.loadingSpecies = true;
      this.selectedSpeciesSub = forkJoin(observables).subscribe((results: IGlobalSpeciesWithAnnotation[])  => {
        this.selectedSpecies = results;
        this.rectangles = this.selectedSpecies.filter(s => s.annotation.area).map(s => ({
          label: s.commonName,
          area: s.annotation.area
        }));
        this.loadingSpecies = false;
        this.cdr.markForCheck();
      });
    }
  }
}
