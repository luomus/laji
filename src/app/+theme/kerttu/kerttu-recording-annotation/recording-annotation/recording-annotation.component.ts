import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {IRecording} from '../../models';
import {Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-recording-annotation',
  templateUrl: './recording-annotation.component.html',
  styleUrls: ['./recording-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingAnnotationComponent implements OnChanges {
  @Input() recording: IRecording;
  @Input() taxonList: string[];

  selectedTaxons: Taxonomy[] = [];

  // @Output() annotationsChange = new EventEmitter<any>();
  @Output() nextRecordingClick = new EventEmitter();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    this.selectedTaxons = [];
  }

  onTaxonSelect(taxon) {
    this.selectedTaxons = [...this.selectedTaxons, taxon.payload];
  }
}

