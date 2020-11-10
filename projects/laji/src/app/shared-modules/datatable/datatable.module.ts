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
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { DatatableOwnSubmissionsComponent } from './datatable-own-submissions/datatable-own-submissions.component';
import { OwnSubmissionsModule } from '../own-submissions/own-submissions.module';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    LangModule,
    SpinnerModule,
    SharedModule,
    InfoModule,
    DownloadModule,
    LajiUiModule,
    OwnSubmissionsModule
  ],
  declarations: [DatatableComponent, DatatableTemplatesComponent, DataTableFooterComponent, DatatableHeaderComponent, DatatableOwnSubmissionsComponent],
  exports: [DatatableComponent, DatatableTemplatesComponent, DataTableFooterComponent, DatatableHeaderComponent,
    DatatableOwnSubmissionsComponent, OwnSubmissionsModule]
})
export class DatatableModule { }
