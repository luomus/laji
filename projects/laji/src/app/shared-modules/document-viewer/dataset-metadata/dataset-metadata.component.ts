import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { Collection } from '../../../shared/model/Collection';

@Component({
  selector: 'laji-dataset-metadata-viewer',
  templateUrl: './dataset-metadata.component.html',
  styleUrls: ['./dataset-metadata.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataComponent implements OnInit, OnChanges {
  @Input() collection: Collection
  @Input() collectionCounts: Object

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.cd.markForCheck()
  }

  ngOnChanges() {
  }
}
