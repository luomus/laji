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
import { DatatableHeaderComponent } from './datatable-header/datatable-header.component';
import { DownloadModule } from '../download/download.module';
import { LajiUiModule } from '../../../../projects/laji-ui/src/lib/laji-ui.module';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    LangModule,
    SpinnerModule,
    SharedModule,
    InfoModule,
    DownloadModule,
    LajiUiModule
  ],
  declarations: [DatatableComponent, DatatableTemplatesComponent, DataTableFooterComponent, DatatableHeaderComponent],
  exports: [DatatableComponent, DatatableTemplatesComponent, DataTableFooterComponent, DatatableHeaderComponent]
})
export class DatatableModule { }
