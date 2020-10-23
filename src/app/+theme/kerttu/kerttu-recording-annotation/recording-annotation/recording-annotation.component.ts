import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IRecording, IRecordingAnnotation, ITaxonWithAnnotation, TaxonAnnotationType} from '../../models';

@Component({
  selector: 'laji-recording-annotation',
  templateUrl: './recording-annotation.component.html',
  styleUrls: ['./recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingAnnotationComponent implements OnChanges {
  @Input() recording: IRecording;
  @Input() taxonList: string[];

  selectedTaxons: ITaxonWithAnnotation[] = [];

  // @Output() annotationsChange = new EventEmitter<any>();
  @Output() nextRecordingClick = new EventEmitter();
  @Output() saveClick = new EventEmitter<IRecordingAnnotation>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.selectedTaxons = [];
  }

  onTaxonSelect(taxon) {
    this.selectedTaxons = [...this.selectedTaxons, {
      ...taxon.payload,
      annotation: {
        taxon_id: taxon.key,
        type: TaxonAnnotationType.occurs
      }
    }];
  }

  save() {
    const taxonAnnotations = this.selectedTaxons.map(taxon => taxon.annotation);
    this.saveClick.emit({
      taxonAnnotations: taxonAnnotations
    });
  }
}

