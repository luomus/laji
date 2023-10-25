import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { OwnSubmissionsComponent } from './own-submissions.component';
import { OwnDatatableComponent } from './own-datatable/own-datatable.component';
import { FilterColumnsPipe } from './own-datatable/filter-columns.pipe';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { DocumentViewerModule } from '../document-viewer/document-viewer.module';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { YearSliderModule } from '../year-slider/year-slider.module';
import { ModalModule } from 'projects/laji-ui/src/lib/modal/modal.module';
import { TooltipModule } from 'projects/laji-ui/src/lib/tooltip/tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    NgxDatatableModule,
    DocumentViewerModule,
    LajiUiModule,
    YearSliderModule,
    ModalModule,
    TooltipModule
  ],
  declarations: [
    OwnSubmissionsComponent,
    OwnDatatableComponent,
    FilterColumnsPipe
  ],
  exports: [
    OwnSubmissionsComponent,
    FilterColumnsPipe
  ]
})
export class OwnSubmissionsModule { }
