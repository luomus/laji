import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from "@angular/core";

@Component({
  selector: 'laji-map-simple-legend',
  template: `
    <ul class="legend" *ngIf="_legend && _legend.length > 0" [ngStyle]="{'margin-top': 0 }">
      <li *ngFor="let leg of _legend">
        <span class="color" [ngStyle]="{'background-color': leg.color}"></span>{{ leg.label }}
      </li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleLegend implements OnChanges {
  @Input() legend: {[color: string]: string} | undefined;
  _legend: {color: string; label: string}[] = [];
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.legend?.currentValue) {
      return;
    }
    const leg = [];
    Object.keys(changes.legend.currentValue).forEach(color => {
      leg.push({color, label: changes.legend.currentValue[color]});
    });
    this._legend = leg;
  }
}
