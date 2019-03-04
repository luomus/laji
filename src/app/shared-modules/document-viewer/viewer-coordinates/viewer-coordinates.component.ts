import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-viewer-coordinates',
  templateUrl: './viewer-coordinates.component.html',
  styleUrls: ['./viewer-coordinates.component.css'],
})
export class CoordinatesViewerComponent {
  @Input() sourceOfCoordinates: any;
  @Input() ykj: any;
  @Input() ykj1km: any;
  @Input() ykj1kmCenter: any;
  @Input() ykj10km: any;
  @Input() ykj10kmCenter: any;
  @Input() wgs84: any;
  @Input() wgs84Center: any;
  @Input() coordinateAccuracy: number;
}
