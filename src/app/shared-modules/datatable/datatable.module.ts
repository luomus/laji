import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent } from './datatable/datatable.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LangModule } from '../lang/lang.module';
import { SpinnerModule } from '../spinner/spinner.module';
import { SharedModule } from '../../shared/shared.module';
import { DataTableFooterComponent } from './data-table-footer/data-table-footer.component';
import { DatatableTemplatesComponent } from './datatable-templates/datatable-templates.component';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    LangModule,
    SpinnerModule,
    SharedModule,
    InfoModule
  ],
  declarations: [DatatableComponent, DatatableTemplatesComponent, DataTableFooterComponent],
  exports: [DatatableComponent, DatatableTemplatesComponent, DataTableFooterComponent]
})
export class DatatableModule { }
