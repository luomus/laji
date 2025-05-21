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
  AudioViewerArea,
  AudioViewerMode,
  AudioViewerRectangle,
  AudioViewerRectangleGroup,
  SpectrogramConfig
} from '../../../../../../../laji/src/app/shared-modules/audio-viewer/models';
import { map } from 'rxjs/operators';
import { KerttuGlobalApi } from '../../../../kerttu-global-shared/service/kerttu-global-api';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { KerttuGlobalUtil } from '../../../../kerttu-global-shared/service/kerttu-global-util.service';
import { IdentificationTableComponent } from './identification-table/identification-table.component';
import { defaultSpectrogramConfig } from '../../../../../../../laji/src/app/shared-modules/audio-viewer/variables';
import { lowAudioSampleRate } from '../../../../kerttu-global-shared/variables';
import { DOCUMENT } from '@angular/common';
import { Util } from '../../../../../../../laji/src/app/shared/service/util.service';
import {
  AudioViewerComponent
} from '../../../../../../../laji/src/app/shared-modules/audio-viewer/audio-viewer/audio-viewer.component';

interface ActiveDrawState {
  active: true;
  type: 'species'|'otherSound';
  speciesIdx: number;
  relatedBoxIdx?: number;
}
interface InactiveDrawState {
  active: false;
}
type DrawState = ActiveDrawState|InactiveDrawState;

const batSpectrogramConfig = {
...defaultSpectrogramConfig,
    targetWindowLengthInSeconds: 0.004
};

@Component({
  selector: 'bsg-identification-view',
  templateUrl: './identification-view.component.html',
  styleUrls: ['./identification-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentificationViewComponent implements OnChanges, OnDestroy {
  @ViewChild('topContent') topContent?: ElementRef;
  @ViewChild(AudioViewerComponent) audioViewer?: AudioViewerComponent;
  @ViewChild('speciesIdentificationTable') identificationTable?: IdentificationTableComponent;
  @ViewChild('otherSoundsIdentificationTable') otherSoundsIdentificationTable?: IdentificationTableComponent;

  @Input({ required: true }) recording!: IGlobalRecording;
  @Input({ required: true }) annotation!: IGlobalRecordingAnnotation;
  @Input() buttonsDisabled = false;

  selectedSpecies: IGlobalSpeciesWithAnnotation[] = [];
  selectedOtherSounds: IGlobalSpeciesWithAnnotation[] = [];
  loadingSpecies = false;

  sampleRate!: number;
  minFrequency!: number;
  maxFrequency!: number;
  spectrogramConfig!: SpectrogramConfig;
  audioViewerMode: AudioViewerMode = 'default';
  audioViewerRectangles: (AudioViewerRectangle|AudioViewerRectangleGroup)[] = [];

  showWholeFrequencyRange = false;
  showWholeTimeRange = true;

  speciesBoxDrawState: DrawState = {
    active: false
  };

  speciesRectangleColor = 'white';
  overlappingSpeciesRectangleColor = '#d9d926';
  otherSoundRectangleColor = '#d98026';

  taxonTypeEnum = TaxonTypeEnum;

  topContentHeight = 265;

  @Output() annotationChange = new EventEmitter<IGlobalRecordingAnnotation>();

  private selectedSpeciesSub!: Subscription;

  private topContentMinHeight = 180;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private kerttuGlobalApi: KerttuGlobalApi,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    this.updateAudioViewerConfigForType(TaxonTypeEnum.bird);
  }

  destroyDragMoveListener?: () => void;
  destroyDragEndListener?: () => void;

  ngOnChanges(changes: SimpleChanges) {
    this.clearDrawMode();
    if (changes.recording) {
      this.updateAudioViewerConfigForType(this.recording.taxonType);
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

    const newSpecies: IGlobalSpeciesWithAnnotation = {
      ...species,
      annotation: {
        speciesId: species.id,
        occurrence: SpeciesAnnotationEnum.occurs
      }
    };

    if (species.taxonType !== TaxonTypeEnum.other) {
      if (this.selectedSpecies.filter(t => t.annotation.speciesId === species.id).length > 0) {
        return;
      }

      this.selectedSpecies = [...this.selectedSpecies, newSpecies];

      this.updateAnnotation();
      this.scrollDrawButtonIntoView('species', this.selectedSpecies.length - 1);
    } else {
      if (this.selectedOtherSounds.filter(t => t.annotation.speciesId === species.id).length > 0) {
        return;
      }

      this.selectedOtherSounds = [...this.selectedOtherSounds, newSpecies];

      this.updateAnnotation();
      this.scrollDrawButtonIntoView('otherSound', this.selectedOtherSounds.length - 1);
    }
  }

  onDrawBirdClick(type: 'species'|'otherSound', data: {drawClicked: boolean; rowIndex: number; boxIndex?: number}) {
    this.speciesBoxDrawState = data.drawClicked ? {
      active: true,
      type,
      speciesIdx: data.rowIndex,
      relatedBoxIdx: data.boxIndex
    } : { active: false };
    this.audioViewerMode = this.speciesBoxDrawState.active ? 'draw' : 'default';
  }

  drawEnd(area: AudioViewerArea) {
    if (!this.speciesBoxDrawState.active) {
      return;
    }

    const { type, speciesIdx, relatedBoxIdx } = this.speciesBoxDrawState;

    const selectedSpecies = Util.clone(type === 'species' ? this.selectedSpecies : this.selectedOtherSounds);
    const boxes = selectedSpecies[speciesIdx].annotation.boxes || [];

    if (relatedBoxIdx !== undefined) {
      let boxGroup = boxes[relatedBoxIdx];
      if (!isBoxGroup(boxGroup)) {
        boxGroup = {boxes: [boxGroup]};
      }
      boxGroup.boxes.push({area});
      boxGroup.boxes.sort((a: IGlobalSpeciesAnnotationBox, b: IGlobalSpeciesAnnotationBox) => a.area.xRange![0] - b.area.xRange![0]);
      boxes[relatedBoxIdx] = boxGroup;
    } else {
      boxes.push({area});
    }

    selectedSpecies[speciesIdx].annotation.boxes = boxes;

    if (type === 'species') {
      this.selectedSpecies = selectedSpecies;
    } else {
      this.selectedOtherSounds = selectedSpecies;
    }

    this.scrollDrawButtonIntoView(type, speciesIdx, relatedBoxIdx);

    this.clearDrawMode();
    this.updateSpectrogramAndAnnotation();
  }

  removeDrawing(type: 'species'|'otherSound', data: {rowIndex: number; boxIndex: number; boxGroupIndex?: number}) {
    const selectedSpecies = Util.clone(type === 'species' ? this.selectedSpecies : this.selectedOtherSounds);
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

    if (type === 'species') {
      this.selectedSpecies = selectedSpecies;
    } else {
      this.selectedOtherSounds = selectedSpecies;
    }

    this.updateSpectrogramAndAnnotation();
  }

  updateSpectrogramAndAnnotation() {
    this.updateSpectrogramRectangles();
    this.updateAnnotation();
  }

  updateAnnotation() {
    const speciesAnnotations: IGlobalSpeciesAnnotation[] = this.selectedSpecies.map(s => s.annotation);
    const otherAnnotations: IGlobalSpeciesAnnotation[] = this.selectedOtherSounds.map(s => s.annotation);

    this.annotationChange.emit({
      ...this.annotation,
      speciesAnnotations: speciesAnnotations.concat(otherAnnotations)
    });
  }

  onAudioViewerModeChange() {
    if (this.audioViewerMode !== 'draw') {
      this.speciesBoxDrawState.active = false;
    }
  }

  updateAudioViewerConfigForType(taxonType: TaxonTypeEnum) {
    this.sampleRate = KerttuGlobalUtil.getDefaultSampleRate(taxonType);
    this.minFrequency = 0;
    this.maxFrequency = (taxonType === TaxonTypeEnum.bird && !this.showWholeFrequencyRange ? lowAudioSampleRate : this.sampleRate) / 2;

    if (taxonType === TaxonTypeEnum.bat) {
      this.spectrogramConfig = batSpectrogramConfig;
    } else {
      this.spectrogramConfig = defaultSpectrogramConfig;
    }
  }

  onDragStart() {
    this.destroyDragListeners();
    this.destroyDragMoveListener = this.renderer.listen(this.document, 'mousemove', this.onDrag.bind(this));
    this.destroyDragEndListener = this.renderer.listen(this.document, 'mouseup', this.onDragEnd.bind(this));
  }

  private clearDrawMode() {
    this.speciesBoxDrawState.active = false;
    this.audioViewerMode = 'default';
  }

  private updateSelectedSpeciesAndSpectrogramRectangles() {
    if (this.selectedSpeciesSub) {
      this.selectedSpeciesSub.unsubscribe();
    }

    this.selectedSpecies = [];
    this.selectedOtherSounds = [];
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
        this.selectedSpecies = results.filter(s => s.taxonType !== TaxonTypeEnum.other);
        this.selectedOtherSounds = results.filter(s => s.taxonType === TaxonTypeEnum.other);
        this.loadingSpecies = false;
        this.updateSpectrogramRectangles();
        this.cdr.markForCheck();
      });
    } else {
      this.loadingSpecies = false;
    }
  }

  private updateSpectrogramRectangles() {
    const speciesRectangles = this.getSpectrogramRectanglesForAnnotations(this.selectedSpecies, this.speciesRectangleColor, this.overlappingSpeciesRectangleColor);
    const otherRectangles = this.getSpectrogramRectanglesForAnnotations(this.selectedOtherSounds, this.otherSoundRectangleColor, this.otherSoundRectangleColor);

    this.audioViewerRectangles = speciesRectangles.concat(otherRectangles);
  }

  private getSpectrogramRectanglesForAnnotations(speciesAnnotations: IGlobalSpeciesWithAnnotation[], color: string, overlapColor: string) {
    const boxToRectangle = (box: IGlobalSpeciesAnnotationBox, speciesIdx: number, idx: number, groupIdx?: number) => ({
      label: KerttuGlobalUtil.getBoxLabel(speciesIdx, idx, groupIdx),
      area: box.area,
      color: box.overlapsWithOtherSpecies ? overlapColor : color
    });

    return  speciesAnnotations.reduce((rectangles, species, speciesIdx) => {
      (species.annotation.boxes || []).forEach((box, idx) => {
        if (isBoxGroup(box)) {
          rectangles.push({
            rectangles: box.boxes.map((b, i) => boxToRectangle(b, speciesIdx, idx, i)),
            color
          });
        } else {
          rectangles.push(boxToRectangle(box, speciesIdx, idx));
        }
      });
      return rectangles;
    }, [] as (AudioViewerRectangle|AudioViewerRectangleGroup)[]);
  }

  private scrollDrawButtonIntoView(type: 'species'|'otherSound', idx: number, boxIdx?: number) {
    // timeout ensures that the view is rendered before scrolling
    setTimeout(() => {
      const table = type === 'species' ? this.identificationTable : this.otherSoundsIdentificationTable;
      table!.scrollDrawButtonIntoView(idx, boxIdx);
    }, 0);
  }

  private onDrag(mousemove: MouseEvent) {
    const topOffset = this.topContent!.nativeElement.getBoundingClientRect().top + this.document.body.scrollTop;
    const height = mousemove.clientY - topOffset;
    this.topContentHeight = Math.max(this.topContentMinHeight, height);
    this.audioViewer!.resize();
    this.cdr.markForCheck();
  }

  private onDragEnd() {
    this.destroyDragListeners();
    this.audioViewer!.resize();
    this.cdr.markForCheck();
  }

  private destroyDragListeners() {
    this.destroyDragMoveListener?.();
    this.destroyDragEndListener?.();
  }
}
