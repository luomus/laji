import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-map',
  template: ''
})
export class LajiMapComponent {

  @Input() legend: any;
  @Input() options: any;
  @Input() settingsKey: string;
  @Input() data: any = [];
  @Input() loading = false;
  @Input() showControls = true;
  @Input() maxBounds: [[number, number], [number, number]];
  @Input() tileLayerOpacity: number;
  @Input() onPopupClose: (elem: string | HTMLElement) => void;

  @Output() create = new EventEmitter();
  @Output() move = new EventEmitter();
  @Output() tileLayersChange = new EventEmitter();

  map: any;
  lang: string;

  drawToMap(type: string) {}
  setData(data: any) {}
}
