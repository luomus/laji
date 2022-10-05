import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LajiMapVisualization } from './laji-map-visualization';

@Component({
  selector: 'laji-map-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiMapLegendComponent<T extends string> {
  @Input() visualization: LajiMapVisualization<T>;
  @Input() mode: T;
  @Input() displayObservationAccuracy = false;
  @Output() modeChange = new EventEmitter<T>();

  switchMode(m: T) {
    this.mode = m;
    this.modeChange.emit(m);
  }

  getModes(): T[] {
    return <T[]>Object.keys(this.visualization);
  }
}
