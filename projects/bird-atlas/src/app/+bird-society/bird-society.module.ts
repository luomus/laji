import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { routing } from './bird-society.routes';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SpinnerModule } from 'projects/laji/src/app/shared-modules/spinner/spinner.module';
import { RouterModule } from '@angular/router';
import { BirdSocietyIndexComponent } from './bird-society-index/bird-society-index.component';
import { BirdSocietyInfoComponent } from './bird-society-info/bird-society-info.component';

@NgModule({
  imports: [
    routing,
    CommonModule,
    TranslateModule,
    NgxDatatableModule,
    SpinnerModule,
    RouterModule
  ],
  declarations: [BirdSocietyIndexComponent, BirdSocietyInfoComponent]
})
export class BirdSocietyModule { }
