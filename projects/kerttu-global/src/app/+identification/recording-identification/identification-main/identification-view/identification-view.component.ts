import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  IGlobalRecording,
  IGlobalRecordingAnnotation,
  IGlobalSpecies,
  IGlobalSpeciesAnnotation,
  IGlobalSpeciesAnnotationBox,
  IGlobalSpeciesWithAnnotation,
  isBoxGroup,
  SpeciesAnnotationEnum,
  TaxonTypeEnum
} from '../../../../kerttu-global-shared/models';
import {
  AudioViewerMode,
  IAudioViewerArea,
  IAudioViewerRectangle, IAudioViewerRectangleGroup,
  ISpectrogramConfig
} from '../../../../../../../laji/src/app/shared-modules/audio-viewer/models';
import { map } from 'rxjs/operators';
import { KerttuGlobalApi } from '../../../../kerttu-global-shared/service/kerttu-global-api';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { KerttuGlobalUtil } from '../../../../kerttu-global-shared/service/kerttu-global-util.service';
import { IdentificationTableComponent } from './identification-table/identification-table.component';
import { defaultSpectrogramConfig } from '../../../../../../../laji/src/app/shared-modules/audio-viewer/variables';
import {
  defaultAudioSampleRate,
  defaultBatAudioSampleRate,
  defaultInsectAudioSampleRate,
  lowAudioSampleRate
} from '../../../../kerttu-global-shared/variables';
import { DOCUMENT } from '@angular/common';
import { AudioViewerComponent } from '../../../../../../../laji/src/app/shared-modules/audio-viewer/audio-viewer/audio-viewer.component';
import { Util } from '../../../../../../../laji/src/app/shared/service/util.service';


@Component({
  selector: 'bsg-identification-view',
  templateUrl: './identification-view.component.html',
  styleUrls: ['./identification-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationViewComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('topContent') topContent?: ElementRef;
  @ViewChild(AudioViewerComponent) audioViewer?: AudioViewerComponent;
  @ViewChild(IdentificationTableComponent) identificationTable?: IdentificationTableComponent;

  @Input({ required: true }) recording!: IGlobalRecording;
  @Input({ required: true }) annotation!: IGlobalRecordingAnnotation;
  @Input() buttonsDisabled = false;

  selectedSpecies: IGlobalSpeciesWithAnnotation[] = [];
  loadingSpecies = false;

  sampleRate!: number;
  spectrogramConfig!: ISpectrogramConfig;
  audioViewerMode: AudioViewerMode = 'default';
  audioViewerRectangles: (IAudioViewerRectangle|IAudioViewerRectangleGroup)[] = [];

  slowDownAudio = false;
  showWholeFrequencyRange = false;
  showWholeTimeRange = true;

  drawBirdActive = false;
  drawBirdIndex = -1;
  drawBirdRelatedBoxIndex = -1;
  drawNonBirdActive = false;

  birdRectangleColor = 'white';
  overlappingBirdRectangleColor = '#d9d926';
  nonBirdRectangleColor = '#d98026';

  taxonTypeEnum = TaxonTypeEnum;

  topContentHeight = 265;

  @Output() annotationChange = new EventEmitter<IGlobalRecordingAnnotation>();

  private selectedSpeciesSub!: Subscription;
  private nonBirdLabel = '';

  private topContentMinHeight = 180;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private kerttuGlobalApi: KerttuGlobalApi,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    this.updateSpectrogramConfig();
  }

  destroyDragMoveListener?: () => void;
  destroyDragEndListener?: () => void;

  ngOnInit() {
    this.nonBirdLabel = this.translate.instant('identification.nonBird');
  }

  ngOnChanges(changes: SimpleChanges) {
    this.clearDrawMode();
    if (changes.recording) {
      this.sampleRate = KerttuGlobalUtil.getDefaultSampleRate(this.recording.taxonType);
      this.updateSpectrogramConfig();
      this.updateSelectedSpeciesAndSpectrogramRectangles();
    }
  }

  ngOnDestroy() {
    this.destroyDragListeners();
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

  onDrawBirdClick(data: {drawClicked: boolean; rowIndex: number; boxIndex?: number}) {
    this.drawBirdActive = data.drawClicked;
    this.drawBirdIndex = data.rowIndex;
    this.drawBirdRelatedBoxIndex = data.boxIndex != null ? data.boxIndex : -1;
    this.drawNonBirdActive = false;
    this.audioViewerMode = this.drawBirdActive ? 'draw' : 'default';
  }

  toggleDrawNonBird() {
    this.drawBirdActive = false;
    this.drawBirdIndex = -1;
    this.drawBirdRelatedBoxIndex = -1;
    this.drawNonBirdActive = !this.drawNonBirdActive;
    this.audioViewerMode = this.drawNonBirdActive ? 'draw' : 'default';
  }

  drawEnd(area: IAudioViewerArea) {
    if (this.drawBirdIndex >= 0) {
      const selectedSpecies = Util.clone(this.selectedSpecies);
      const boxes = selectedSpecies[this.drawBirdIndex].annotation.boxes || [];

      if (this.drawBirdRelatedBoxIndex >= 0) {
        let boxGroup = boxes[this.drawBirdRelatedBoxIndex];
        if (!isBoxGroup(boxGroup)) {
          boxGroup = {boxes: [boxGroup]};
        }
        boxGroup.boxes.push({area});
        boxGroup.boxes.sort((a: IGlobalSpeciesAnnotationBox, b: IGlobalSpeciesAnnotationBox) => a.area.xRange![0] - b.area.xRange![0]);
        boxes[this.drawBirdRelatedBoxIndex] = boxGroup;
      } else {
        boxes.push({area});
      }

      selectedSpecies[this.drawBirdIndex].annotation.boxes = boxes;
      this.selectedSpecies = selectedSpecies;
      this.scrollDrawButtonIntoView(this.drawBirdIndex, this.drawBirdRelatedBoxIndex >= 0 ? this.drawBirdRelatedBoxIndex : undefined);
    } else {
      this.annotation.nonBirdArea = area;
    }

    this.clearDrawMode();
    this.updateSpectrogramAndAnnotation();
  }

  removeDrawing(data?: {rowIndex: number; boxIndex: number; boxGroupIndex?: number}) {
    if (data) {
      const selectedSpecies = Util.clone(this.selectedSpecies);
      const boxes = selectedSpecies[data.rowIndex].annotation.boxes;
      const box = boxes[data.boxIndex];

      if (isBoxGroup(box)) {
        box.boxes.splice(data.boxGroupIndex!, 1);
        if (box.boxes.length === 1) {
          boxes[data.boxIndex] = box.boxes[0];
        }
      } else {
        boxes.splice(data.boxIndex, 1);
      }

      this.selectedSpecies = selectedSpecies;
    } else {
      this.annotation.nonBirdArea = undefined;
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

  updateSpectrogramConfig() {
    if (this.recording?.taxonType === TaxonTypeEnum.bat) {
      this.spectrogramConfig = {
        ...defaultSpectrogramConfig,
        sampleRate: defaultBatAudioSampleRate,
        targetWindowLengthInSeconds: 0.004,
        minFrequency: this.showWholeFrequencyRange ? 0 : 14000
      };
    } else if (this.recording?.taxonType === TaxonTypeEnum.insect) {
      this.spectrogramConfig = {
        ...defaultSpectrogramConfig,
        sampleRate: defaultInsectAudioSampleRate
      };
    } else {
      this.spectrogramConfig = {
        ...defaultSpectrogramConfig,
        sampleRate: this.showWholeFrequencyRange ? defaultAudioSampleRate : lowAudioSampleRate
      };
    }
  }

  onDragStart() {
    this.destroyDragListeners();
    this.destroyDragMoveListener = this.renderer.listen(this.document, 'mousemove', this.onDrag.bind(this));
    this.destroyDragEndListener = this.renderer.listen(this.document, 'mouseup', this.onDragEnd.bind(this));
  }

  private clearDrawMode() {
    this.drawBirdActive = false;
    this.drawNonBirdActive = false;
    this.audioViewerMode = 'default';
  }

  private updateSelectedSpeciesAndSpectrogramRectangles() {
    if (this.selectedSpeciesSub) {
      this.selectedSpeciesSub.unsubscribe();
    }

    this.selectedSpecies = [];
    this.updateSpectrogramRectangles();

    const speciesAnnotations = this.annotation?.speciesAnnotations;

    if (speciesAnnotations && speciesAnnotations.length > 0) {
      const observables: Observable<IGlobalSpeciesWithAnnotation>[] = speciesAnnotations!.map(
        annotation => this.kerttuGlobalApi.getSpecies(this.translate.currentLang, annotation.speciesId, true).pipe(
          map(species => ({ ...species, annotation }))
        )
      );

      this.loadingSpecies = true;
      this.selectedSpeciesSub = forkJoin(observables).subscribe((results: IGlobalSpeciesWithAnnotation[])  => {
        this.selectedSpecies = results;
        this.loadingSpecies = false;
        this.updateSpectrogramRectangles();
        this.cdr.markForCheck();
      });
    } else {
      this.loadingSpecies = false;
    }
  }

  private updateSpectrogramRectangles() {
    const boxToRectangle = (box: IGlobalSpeciesAnnotationBox, speciesIdx: number, idx: number, groupIdx?: number) => ({
      label: KerttuGlobalUtil.getBoxLabel(speciesIdx, idx, groupIdx),
      area: box.area,
      color: box.overlapsWithOtherSpecies ? this.overlappingBirdRectangleColor : this.birdRectangleColor
    });

    this.audioViewerRectangles = this.selectedSpecies.reduce((rectangles, species, speciesIdx) => {
      (species.annotation.boxes || []).forEach((box, idx) => {
        if (isBoxGroup(box)) {
          rectangles.push({
            rectangles: box.boxes.map((b, i) => boxToRectangle(b, speciesIdx, idx, i)),
            color: this.birdRectangleColor
          });
        } else {
          rectangles.push(boxToRectangle(box, speciesIdx, idx));
        }
      });
      return rectangles;
    }, [] as (IAudioViewerRectangle|IAudioViewerRectangleGroup)[]);

    if (this.annotation.nonBirdArea) {
      this.audioViewerRectangles.push({
        label: this.nonBirdLabel,
        area: this.annotation.nonBirdArea,
        color: this.nonBirdRectangleColor
      });
    }
  }

  private scrollDrawButtonIntoView(idx: number, boxIdx?: number) {
    // timeout ensures that the view is rendered before scrolling
    setTimeout(() => {
      this.identificationTable!.scrollDrawButtonIntoView(idx, boxIdx);
    }, 0);
  }

  private onDrag(mousemove: MouseEvent) {
    const topOffset = this.topContent!.nativeElement.getBoundingClientRect().top + this.document.body.scrollTop;
    const height = mousemove.clientY - topOffset;
    this.topContentHeight = Math.max(this.topContentMinHeight, height);
    this.audioViewer!.resize();
  }

  private onDragEnd() {
    this.destroyDragListeners();
    this.audioViewer!.resize();
  }

  private destroyDragListeners() {
    this.destroyDragMoveListener?.();
    this.destroyDragEndListener?.();
  }
}
