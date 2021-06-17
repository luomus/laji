import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsRoutingModule } from './results-routing.module';
import { ResultsComponent } from './results.component';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { KerttuGlobalSharedModule } from '../kerttu-global-shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ResultsRoutingModule,
    SharedModule,
    KerttuGlobalSharedModule
  ],
  declarations: [ResultsComponent]
})
export class ResultsModule { }
