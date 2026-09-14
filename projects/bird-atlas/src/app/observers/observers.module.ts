import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { routing } from './observers.routes';
import { ObserversComponent } from './observers.component';
import { NgxDatatableModule } from '@achimha/ngx-datatable';
import { SpinnerModule } from 'projects/laji/src/app/shared-modules/spinner/spinner.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ObserversComponent],
  imports: [
    routing,
    CommonModule,
    TranslateModule,
    NgxDatatableModule,
    SpinnerModule,
    ReactiveFormsModule
  ]
})
export class ObserversModule { }
