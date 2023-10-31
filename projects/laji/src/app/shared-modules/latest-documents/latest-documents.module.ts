import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { UsersLatestComponent } from './latest/haseka-users-latest.component';
import { ShortDocumentComponent } from './latest/short-document.component';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { TooltipModule } from 'projects/laji-ui/src/lib/tooltip/tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LajiUiModule,
    TooltipModule
  ],
  declarations: [UsersLatestComponent, ShortDocumentComponent],
  exports: [UsersLatestComponent]
})
export class LatestDocumentsModule { }
