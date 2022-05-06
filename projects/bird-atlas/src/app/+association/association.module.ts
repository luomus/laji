import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { routing } from './association.routes';
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
  declarations: []
})
export class AssociationModule { }
