import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent } from './datatable/datatable.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LangModule } from '../lang/lang.module';
import { SpinnerModule } from '../spinner/spinner.module';
import { SharedModule } from '../../shared/shared.module';
import { PublicationPipe } from './pipe/publication.pipe';
import { DataTableFooterComponent } from './data-table-footer/data-table-footer.component';
import { DatatableTemplatesComponent } from './datatable-templates/datatable-templates.component';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    LangModule,
    SpinnerModule,
    SharedModule
  ],
  declarations: [DatatableComponent, DatatableTemplatesComponent, PublicationPipe, DataTableFooterComponent],
  exports: [DatatableComponent, DatatableTemplatesComponent]
})
export class DatatableModule { }
