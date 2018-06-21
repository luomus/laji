import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { OwnSubmissionsComponent } from './own-submissions.component';
import { YearSliderComponent } from './year-slider/year-slider.component';
import { OwnDatatableComponent } from './own-datatable/own-datatable.component';
import { FilterColumnsPipe } from './own-datatable/filter-columns.pipe';
import { DocumentInfoService } from './service/document-info.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { RouterChildrenEventService } from './service/router-children-event.service';
import { ViewerModule } from '../../+viewer/viewer.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    NgxDatatableModule,
    ViewerModule
  ],
  declarations: [
    OwnSubmissionsComponent,
    YearSliderComponent,
    OwnDatatableComponent,
    FilterColumnsPipe
  ],
  providers: [
    DocumentInfoService,
    RouterChildrenEventService
  ],
  exports: [
    OwnSubmissionsComponent
  ]
})
export class OwnSubmissionsModule { }
