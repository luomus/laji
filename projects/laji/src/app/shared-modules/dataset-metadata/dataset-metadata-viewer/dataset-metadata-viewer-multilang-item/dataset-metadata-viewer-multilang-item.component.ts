import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-dataset-metadata-viewer-multilang-item',
  templateUrl: './dataset-metadata-viewer-multilang-item.component.html',
  styleUrls: ['./dataset-metadata-viewer-multilang-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DatasetMetadataViewerMultilangItemComponent {
  @Input() values = [];
}
