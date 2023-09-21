import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VisualizationMode } from './visualization-mode';

@Component({
  selector: 'ba-visualization-selector',
  template: `
    <h6>Visualisointi</h6>
    <div class="radio">
        <label>
          <input type="radio" name="optradio" [(ngModel)]="visualization" value="activityCategory">
          {{ 'ba.grid-index.map.activityCategory' | translate }}
        </label>
      </div>
      <div class="radio">
        <label>
          <input type="radio" name="optradio" [(ngModel)]="visualization" value="speciesCount">
          {{ 'ba.grid-index.map.speciesCount' | translate }}
        </label>
      </div>
  `
})
export class VisualizationSelectorComponent {
  private _visualization: VisualizationMode = 'activityCategory';
  @Input() get visualization(): VisualizationMode {
    return this._visualization;
  }
  set visualization(v: VisualizationMode) {
    this._visualization = v;
    this.visualizationChange.emit(v);
  }
  @Output() visualizationChange = new EventEmitter<VisualizationMode>();
}
