import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { OwnSubmissionsComponent } from './own-submissions.component';
import { YearSliderComponent } from './year-slider/year-slider.component';
import { OwnDatatableComponent } from './own-datatable/own-datatable.component';
import { FilterColumnsPipe } from './own-datatable/filter-columns.pipe';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { DocumentViewerModule } from '../document-viewer/document-viewer.module';
import { LajiUiModule } from '../../../../projects/laji-ui/src/lib/laji-ui.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    NgxDatatableModule,
    DocumentViewerModule,
    LajiUiModule
  ],
  declarations: [
    OwnSubmissionsComponent,
    YearSliderComponent,
    OwnDatatableComponent,
    FilterColumnsPipe
  ],
  exports: [
    OwnSubmissionsComponent
  ]
})
export class OwnSubmissionsModule { }
