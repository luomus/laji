import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, SimpleChanges, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import {
  IGlobalSpecies,
  IGlobalRecordingAnnotation,
  IGlobalSpeciesAnnotation,
  SpeciesAnnotationEnum,
  IGlobalRecording, IGlobalSpeciesWithAnnotation, IGlobalRecordingStatusInfo
} from '../../../kerttu-global-shared/models';
import { AudioViewerMode, IAudioViewerArea, IAudioViewerRectangle } from '../../../../../../laji/src/app/shared-modules/audio-viewer/models';
import { map } from 'rxjs/operators';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'bsg-identification-view',
  templateUrl: './identification-view.component.html',
  styleUrls: ['./identification-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationViewComponent implements OnInit, OnChanges {
  @Input() recording: IGlobalRecording;
  @Input() annotation: IGlobalRecordingAnnotation;
  @Input() statusInfo: IGlobalRecordingStatusInfo;
  @Input() buttonsAreDisabled = false;

  selectedSpecies: IGlobalSpeciesWithAnnotation[] = [];

  loadingSpecies = false;
  audioViewerMode: AudioViewerMode = 'default';
  rectangles: IAudioViewerRectangle[] = [];

  drawBirdActive = false;
  drawBirdIndex?: number;
  drawNonBirdActive = false;

  @Output() nextRecordingClick = new EventEmitter();
  @Output() previousRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter();
  @Output() annotationChange = new EventEmitter<IGlobalRecordingAnnotation>();
  @Output() backToSiteSelectionClick = new EventEmitter();

  private selectedSpeciesSub: Subscription;
  private nonBirdLabel = '';

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.nonBirdLabel = this.translate.instant('identification.recordings.nonBird');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recording) {
      this.rectangles = [];
      this.updateSelectedSpecies();
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

  onDrawBirdClick(data: {drawClicked: boolean, rowIndex: number}) {
    this.drawBirdActive = data.drawClicked;
    this.drawBirdIndex = data.rowIndex;
    this.drawNonBirdActive = false;
    this.audioViewerMode = this.drawBirdActive ? 'draw' : 'default';
  }

  toggleDrawNonBird() {
    this.drawBirdActive = false;
    this.drawBirdIndex = -1;
    this.drawNonBirdActive = !this.drawNonBirdActive;
    this.audioViewerMode = this.drawNonBirdActive ? 'draw' : 'default';
  }

  drawEnd(area: IAudioViewerArea) {
    let rectangleLabel: string;

    if (this.drawBirdIndex >= 0) {
      this.selectedSpecies[this.drawBirdIndex].annotation.area = area;
      this.selectedSpecies = [...this.selectedSpecies];
      rectangleLabel = this.selectedSpecies[this.drawBirdIndex].commonName;
    } else {
      this.annotation.nonBirdArea = area;
      rectangleLabel = this.nonBirdLabel;
    }

    this.rectangles = this.rectangles.filter(r => r.label !== rectangleLabel);
    this.rectangles = [...this.rectangles, {area: area, label: rectangleLabel}];

    this.drawBirdActive = false;
    this.drawNonBirdActive = false;
    this.audioViewerMode = 'default';

    this.updateAnnotation();
  }

  removeDrawing(rowIndex: number) {
    let rectangleLabel: string;

    if (rowIndex >= 0) {
      this.selectedSpecies[rowIndex].annotation.area = null;
      this.selectedSpecies = [...this.selectedSpecies];
      rectangleLabel = this.selectedSpecies[rowIndex].commonName;
    } else {
      this.annotation.nonBirdArea = null;
      rectangleLabel = this.nonBirdLabel;
    }

    this.rectangles = this.rectangles.filter(r => r.label !== rectangleLabel);

    this.updateAnnotation();
  }

  updateAnnotation() {
    const speciesAnnotations: IGlobalSpeciesAnnotation[] = this.selectedSpecies.map(species => species.annotation);

    this.annotationChange.emit({
      ...this.annotation,
      speciesAnnotations: speciesAnnotations
    });
  }

  onAudioViewerModeChange() {
    if (this.audioViewerMode !== 'draw') {
      this.drawBirdActive = false;
      this.drawNonBirdActive = false;
    }
  }

  private updateSelectedSpecies() {
    if (this.selectedSpeciesSub) {
      this.selectedSpeciesSub.unsubscribe();
    }

    this.selectedSpecies = [];

    const speciesAnnotations = this.annotation?.speciesAnnotations;

    if (speciesAnnotations?.length > 0) {
      const observables: Observable<IGlobalSpeciesWithAnnotation>[] = speciesAnnotations.map(
        a => this.kerttuGlobalApi.getSpecies(a.speciesId, true).pipe(map(species => {
          return {...species, annotation: a};
        }))
      );

      this.loadingSpecies = true;
      this.selectedSpeciesSub = forkJoin(observables).subscribe((results: IGlobalSpeciesWithAnnotation[])  => {
        this.selectedSpecies = results;
        this.loadingSpecies = false;
        this.initRectangles();
        this.cdr.markForCheck();
      });
    }
  }

  private initRectangles() {
    this.rectangles = this.selectedSpecies.filter(s => s.annotation.area).map(s => ({
      label: s.commonName,
      area: s.annotation.area
    }));
    if (this.annotation.nonBirdArea) {
      this.rectangles.push({
        label: this.nonBirdLabel,
        area: this.annotation.nonBirdArea
      });
    }
  }
}
