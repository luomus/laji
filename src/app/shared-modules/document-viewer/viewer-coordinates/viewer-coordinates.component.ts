import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { convert } from 'laji-map/lib/utils';

@Component({
  selector: 'laji-viewer-coordinates',
  templateUrl: './viewer-coordinates.component.html',
  styleUrls: ['./viewer-coordinates.component.css'],
})
export class CoordinatesViewerComponent {
  @Input() ykj: any;
  @Input() wgs84: any;
}
