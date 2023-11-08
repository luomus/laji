/* eslint-disable max-len */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IucnClassComponent } from './iucn-class/iucn-class.component';
import { TaxonStatusHistoryComponent } from './taxon-status-history/taxon-status-history.component';
import { IucnStatusPipe } from './pipe/iucn-status.pipe';
import { IucnHyphensPipe } from './pipe/iucn-hyphens.pipe';
import { StatusMarkComponent } from './status-mark/status-mark.component';
import { ExplainCriteriaPipe } from './pipe/explain-criteria.pipe';
import { TooltipModule } from 'projects/laji-ui/src/lib/tooltip/tooltip.module';

/* eslint-enable max-len */

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TooltipModule
  ],
  declarations: [
    IucnClassComponent,
    TaxonStatusHistoryComponent,
    IucnStatusPipe,
    IucnHyphensPipe,
    StatusMarkComponent,
    ExplainCriteriaPipe
  ],
  exports: [
    IucnClassComponent,
    TaxonStatusHistoryComponent,
    IucnStatusPipe,
    StatusMarkComponent,
    ExplainCriteriaPipe
  ]
})
export class IucnCommonModule { }
