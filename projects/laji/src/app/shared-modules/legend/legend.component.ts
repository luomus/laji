import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LajiMapVisualization } from './laji-map-visualization';

@Component({
  selector: 'laji-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendComponent<T extends string> implements OnChanges {
  @Input() visualization: LajiMapVisualization<T>;
  @Input() mode: T;
  @Input() displayObservationAccuracy = false;
  @Output() modeChange = new EventEmitter<T>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes.visualization?.currentValue) {
      this.mode = <T>Object.keys(this.visualization)[0];
    }
  }

  switchMode(m: T) {
    this.mode = m;
    this.modeChange.emit(m);
  }

  getModes(): T[] {
    if (!this.visualization) { return []; }
    return <T[]>Object.keys(this.visualization);
  }
}
