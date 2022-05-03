import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  OnInit,
  OnChanges,
  ChangeDetectorRef,
  ViewChild
} from '@angular/core';
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
import { KerttuGlobalUtil } from '../../../kerttu-global-shared/service/kerttu-global-util.service';
import { IdentificationTableComponent } from './identification-table/identification-table.component';


@Component({
  selector: 'bsg-identification-view',
  templateUrl: './identification-view.component.html',
  styleUrls: ['./identification-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationViewComponent implements OnInit, OnChanges {
  @ViewChild(IdentificationTableComponent) identificationTable: IdentificationTableComponent;

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

  birdRectangleColor = 'white';
  overlappingBirdRectangleColor = '#d9d926';
  nonBirdRectangleColor = '#d98026';

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
    this.scrollDrawButtonIntoView(this.selectedSpecies.length - 1);
  }

  onDrawBirdClick(data: {drawClicked: boolean; rowIndex: number}) {
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
    if (this.drawBirdIndex >= 0) {
      const species = this.selectedSpecies[this.drawBirdIndex];
      if (!species.annotation.boxes) {
        species.annotation.boxes = [];
      }
      species.annotation.boxes.push({area});
      this.selectedSpecies = [...this.selectedSpecies];

      this.scrollDrawButtonIntoView(this.drawBirdIndex);
    } else {
      this.annotation.nonBirdArea = area;
    }

    this.drawBirdActive = false;
    this.drawNonBirdActive = false;
    this.audioViewerMode = 'default';

    this.updateSpectrogramAndAnnotation();
  }

  removeDrawing(data?: {rowIndex: number; boxIndex: number}) {
    if (data) {
      this.selectedSpecies[data.rowIndex].annotation.boxes.splice(data.boxIndex, 1);
      this.selectedSpecies = [...this.selectedSpecies];
    } else {
      this.annotation.nonBirdArea = null;
    }

    this.updateSpectrogramAndAnnotation();
  }

  updateSpectrogramAndAnnotation() {
    this.updateSpectrogramRectangles();
    this.updateAnnotation();
  }

  updateAnnotation() {
    const speciesAnnotations: IGlobalSpeciesAnnotation[] = this.selectedSpecies.map(species => species.annotation);

    this.annotationChange.emit({
      ...this.annotation,
      speciesAnnotations
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
        a => this.kerttuGlobalApi.getSpecies(a.speciesId, true).pipe(map(species => ({...species, annotation: a})))
      );

      this.loadingSpecies = true;
      this.selectedSpeciesSub = forkJoin(observables).subscribe((results: IGlobalSpeciesWithAnnotation[])  => {
        this.selectedSpecies = results;
        this.loadingSpecies = false;
        this.updateSpectrogramRectangles();
        this.cdr.markForCheck();
      });
    }
  }

  private updateSpectrogramRectangles() {
    this.rectangles = this.selectedSpecies.reduce((rectangles, species, speciesIdx) => {
      (species.annotation.boxes || []).forEach((box, idx) => {
        rectangles.push({
          label: (speciesIdx + 1) + KerttuGlobalUtil.numberToLetter(idx + 1),
          area: box.area,
          color: box.overlapsWithOtherSpecies ? this.overlappingBirdRectangleColor : this.birdRectangleColor
        });
      });
      return rectangles;
    }, []);

    if (this.annotation.nonBirdArea) {
      this.rectangles.push({
        label: this.nonBirdLabel,
        area: this.annotation.nonBirdArea,
        color: this.nonBirdRectangleColor
      });
    }
  }

  private scrollDrawButtonIntoView(idx: number) {
    // timeout ensures that the view is rendered before scrolling
    setTimeout(() => {
      this.identificationTable.scrollDrawButtonIntoView(idx);
    }, 0);
  }
}
