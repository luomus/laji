import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { GridIndexComponent } from './grid-index/grid-index.component';
import { GridInfoComponent } from './grid-info/grid-info.component';
import { routing } from './grid.routes';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SpinnerModule } from 'projects/laji/src/app/shared-modules/spinner/spinner.module';

@NgModule({
  imports: [
    routing,
    CommonModule,
    TranslateModule,
    NgxDatatableModule,
    SpinnerModule
  ],
  declarations: [GridIndexComponent, GridInfoComponent]
})
export class GridModule { }
