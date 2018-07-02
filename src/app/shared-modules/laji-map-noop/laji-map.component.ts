import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-map',
  template: ''
})
export class LajiMapComponent {

  @Input() legend: any;
  @Input() options: any;
  @Input() lang: string;
  @Input() settingsKey: string;
  @Input() data: any = [];
  @Input() loading = false;
  @Input() showControls = true;
  @Input() maxBounds: [[number, number], [number, number]];
  @Input() tileLayerOpacity: number;
  @Output() select = new EventEmitter();

  @Output() onCreate = new EventEmitter();
  @Output() onMove = new EventEmitter();
  @Output() onFailure =  new EventEmitter();
  @Output() onTileLayerChange =  new EventEmitter();

  map: any;

  drawToMap(type: string) {}
  invalidateSize() {}
}
