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
  @Output() select = new EventEmitter();

  @Output() create = new EventEmitter();
  @Output() move = new EventEmitter();
  @Output() failure =  new EventEmitter();
  @Output() tileLayerChange =  new EventEmitter();

  map: any;
  lang: string;

  drawToMap(type: string) {}
  invalidateSize() {}
}
