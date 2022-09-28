import { Component, OnChanges, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';

const EMPTY_VALUE = ' '

@Component({
  selector: 'laji-dataset-metadata-viewer-item',
  templateUrl: './dataset-metadata-viewer-item.component.html',
  styleUrls: ['./dataset-metadata-viewer-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetMetadataViewerItemComponent implements OnChanges {
  @ViewChild('valueRow') valueRow;
  @Input() title: string;
  @Input() value = EMPTY_VALUE;
  @Input() showWithoutValue = false;
  @Input() hideValue = false;

  show = true;

  constructor() { }

  ngOnChanges() {
    this.initRow();
  }

  initRow() {
    this.show = this.showWithoutValue || !!this.value || this.value === EMPTY_VALUE;
  }
}
