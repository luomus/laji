import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IRecording, IRecordingAnnotation, ITaxonAnnotation, ITaxonWithAnnotation, TaxonAnnotationEnum} from '../../models';
import {TaxonomyApi} from '../../../../shared/api/TaxonomyApi';
import {forkJoin, of, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'laji-recording-annotation',
  templateUrl: './recording-annotation.component.html',
  styleUrls: ['./recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingAnnotationComponent implements OnChanges {
  @Input() recording: IRecording;
  @Input() annotation: IRecordingAnnotation;
  @Input() taxonList: string[];
  @Input() taxonExpertise: string[];

  generalAnnotation: IRecordingAnnotation = {};
  selectedTaxons: {
    main: ITaxonWithAnnotation[];
    other: ITaxonWithAnnotation[];
  };

  loadingTaxons = false;

  @Output() nextRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter<{recordingId: number, annotation: IRecordingAnnotation}>();
  @Output() addToTaxonExpertise = new EventEmitter<string>();

  private selectedTaxonsSub: Subscription;

  constructor(
    private taxonService: TaxonomyApi,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recording || changes.annotation) {
      this.generalAnnotation = {...this.annotation, taxonAnnotations: undefined};
      this.updateSelectedTaxons();
    }
  }

  addTaxonToSelected(taxon: any, type: 'main'|'other') {
    if (this.selectedTaxons[type].filter(t => t.annotation.taxonId === taxon.key).length > 0) {
      return;
    }
    this.selectedTaxons[type] = [...this.selectedTaxons[type], {
      ...taxon.payload,
      annotation: {
        taxonId: taxon.key,
        annotation: TaxonAnnotationEnum.occurs
      }
    }];
  }

  save() {
    const taxonAnnotations = {};
    for (const key of Object.keys(this.selectedTaxons)) {
      taxonAnnotations[key] = this.selectedTaxons[key].map(taxon => taxon.annotation);
    }

    this.saveClick.emit({
      recordingId: this.recording.id,
      annotation: {
        ...this.generalAnnotation,
        taxonAnnotations: taxonAnnotations
      }
    });
  }

  private updateSelectedTaxons() {
    if (this.selectedTaxonsSub) {
      this.selectedTaxonsSub = undefined;
    }

    this.selectedTaxons = {
      'main': [],
      'other': []
    };

    const taxonAnnotations = this.annotation?.taxonAnnotations;

    if (taxonAnnotations?.main?.length > 0 || taxonAnnotations?.other?.length > 0) {
      const observables = [];
      for (const type of ['main', 'other']) {
        if (taxonAnnotations[type]?.length > 0) {
          const obs: Observable<ITaxonWithAnnotation>[] = taxonAnnotations[type].map(
            a => this.taxonService.taxonomyFindBySubject(
              a.taxonId, 'fi', {selectedFields: ['id', 'vernacularName', 'scientificName', 'cursiveName']}
            ).pipe(map(taxon => {
              return {...taxon, annotation: a};
            }))
          );
          observables.push(forkJoin(obs));
        } else {
          observables.push(of([]));
        }
      }

      this.loadingTaxons = true;
      this.selectedTaxonsSub = forkJoin(observables).subscribe((results: ITaxonWithAnnotation[][])  => {
        this.selectedTaxons = {
          'main': results[0],
          'other': results[1]
        };
        this.loadingTaxons = false;
        this.cdr.markForCheck();
      });
    }
  }
}

