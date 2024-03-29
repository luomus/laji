import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GridIndexComponent } from './grid-index/grid-index.component';
import { GridInfoComponent } from './grid-info/grid-info.component';
import { routing } from './grid.routes';
import { NgxDatatableModule } from '@achimha/ngx-datatable';
import { SpinnerModule } from 'projects/laji/src/app/shared-modules/spinner/spinner.module';
import { GridIndexMapComponent } from './grid-index/grid-index-map/grid-index-map.component';
import { GridIndexTableComponent } from './grid-index/grid-index-table/grid-index-table.component';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { MapUtilsModule } from '../shared-modules/map-utils/map-utils.module';
import { GridSquareModule } from '../shared-modules/grid-square/grid-square.module';
import { GridIndexMapTableComponent } from './grid-index/grid-index-map/grid-index-map-table/grid-index-map-table.component';

@NgModule({
  imports: [
    routing,
    CommonModule,
    TranslateModule,
    NgxDatatableModule,
    SpinnerModule,
    LajiUiModule,
    FormsModule,
    MapUtilsModule,
    GridSquareModule
  ],
  declarations: [
    GridIndexComponent, GridInfoComponent, GridIndexMapComponent,
    GridIndexTableComponent, GridIndexMapTableComponent
  ]
})
export class GridModule { }
