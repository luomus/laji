import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IRecording, IRecordingAnnotation, ITaxonWithAnnotation, TaxonAnnotationEnum} from '../../models';
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
  @Input() loadingAnnotation = false;

  generalAnnotation: IRecordingAnnotation = {};
  selectedTaxons: ITaxonWithAnnotation[] = [];

  // @Output() annotationsChange = new EventEmitter<any>();
  @Output() nextRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter<{recordingId: number, annotation: IRecordingAnnotation}>();

  private selectedTaxonsSub: Subscription;

  constructor(
    private taxonService: TaxonomyApi,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.annotation) {
      this.selectedTaxons = [];
      if (this.selectedTaxonsSub) {
        this.selectedTaxonsSub = undefined;
      }

      if (this.annotation?.taxonAnnotations.length > 0) {
        const obs = this.annotation.taxonAnnotations.map(
          a => this.taxonService.taxonomyFindBySubject(
            a.taxonId, 'fi', {selectedFields: ['id', 'vernacularName', 'scientificName', 'cursive']}
          ).pipe(map(taxon => {
            return {...taxon, annotation: a};
          }))
        );
        this.selectedTaxonsSub = forkJoin(obs).subscribe(results => {
          this.selectedTaxons = results;
          this.cdr.markForCheck();
        });
      }
    }
  }

  onTaxonSelect(taxon) {
    this.selectedTaxons = [...this.selectedTaxons, {
      ...taxon.payload,
      annotation: {
        taxonId: taxon.key,
        annotation: TaxonAnnotationEnum.occurs
      }
    }];
  }

  save() {
    const taxonAnnotations = this.selectedTaxons.map(taxon => taxon.annotation);
    this.saveClick.emit({
      recordingId: this.recording.id,
      annotation: {
        taxonAnnotations: taxonAnnotations
      }
    });
  }
}

