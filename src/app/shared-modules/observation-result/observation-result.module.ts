import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationTableComponent } from './observation-table/observation-table.component';
import { ObservationListService } from './service/observation-list.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LangModule } from '../lang/lang.module';
import { SharedModule } from '../../shared/shared.module';
import { DatatableModule } from '../datatable/datatable.module';
import { SelectedFieldGroupComponent } from './selected-field-group/selected-field-group.component';
import { PageSizeSelectComponent } from './page-size-select/page-size-select.component';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    LangModule,
    SharedModule,
    DatatableModule
  ],
  declarations: [ObservationTableComponent, SelectedFieldGroupComponent, PageSizeSelectComponent],
  providers: [ObservationListService],
  exports: [ObservationTableComponent]
})
export class ObservationResultModule { }
