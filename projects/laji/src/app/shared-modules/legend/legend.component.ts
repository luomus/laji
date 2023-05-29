import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LajiMapVisualization } from './laji-map-visualization';
import { PlatformService } from '../../root/platform.service';

@Component({
  selector: 'laji-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendComponent<T extends string> implements OnChanges, AfterViewInit {
  @Input() visualization: LajiMapVisualization<T>;
  @Input() mode: T;
  @Input() displayObservationAccuracy = false;
  @Output() modeChange = new EventEmitter<T>();

  hidden = false;

  constructor(private platformService: PlatformService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    // sm breakpoint from _vars.scss
    if (this.platformService.isBrowser && window.innerWidth <= 768) {
      this.hidden = true;
      this.cdr.markForCheck();
    }
  }

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
