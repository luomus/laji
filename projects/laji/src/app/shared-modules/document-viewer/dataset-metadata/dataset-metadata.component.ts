import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Collection } from '../../../shared/model/Collection';
import { ICollectionCounts } from '../../../shared/service/collection.service';
import { IdService } from '../../../shared/service/id.service';

@Component({
  selector: 'laji-dataset-metadata-viewer',
  templateUrl: './dataset-metadata.component.html',
  styleUrls: ['./dataset-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataComponent implements OnInit, OnChanges {
  @Input() collection: Collection;
  @Input() collectionCounts: ICollectionCounts;

  specimenRecordBasis = [
    "PRESERVED_SPECIMEN",
    "LIVING_SPECIMEN",
    "FOSSIL_SPECIMEN",
    "SUBFOSSIL_SPECIMEN",
    "SUBFOSSIL_AMBER_INCLUSION_SPECIMEN",
    "MICROBIAL_SPECIMEN",
  ]
  obsRecordBasis = [
    "HUMAN_OBSERVATION_UNSPECIFIED",
    "HUMAN_OBSERVATION_SEEN",
    "HUMAN_OBSERVATION_HEARD",
    "HUMAN_OBSERVATION_PHOTO",
    "HUMAN_OBSERVATION_INDIRECT",
    "HUMAN_OBSERVATION_HANDLED",
    "HUMAN_OBSERVATION_VIDEO",
    "HUMAN_OBSERVATION_RECORDED_AUDIO",
    "MACHINE_OBSERVATION_UNSPECIFIED",
    "MACHINE_OBSERVATION_VIDEO",
    "MACHINE_OBSERVATION_AUDIO",
    "MACHINE_OBSERVATION_GEOLOGGER",
    "MACHINE_OBSERVATION_SATELLITE_TRANSMITTER",
    "LITERATURE",
    "MATERIAL_SAMPLE",
  ]
  constructor(
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.cd.markForCheck();
  }

  ngOnChanges() {
  }

  isInternalLink() {
    return /^HR\.\d+$/g.test(this.collection.id);
  }
}
