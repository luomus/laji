import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VisualizationLegendComponent } from './visualization-legend.component';
import { VisualizationSelectorComponent } from './visualization-selector.component copy';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule
  ],
  declarations: [
    VisualizationLegendComponent, VisualizationSelectorComponent
  ],
  exports: [
    VisualizationSelectorComponent, VisualizationLegendComponent
  ]
})
export class MapUtilsModule {}
