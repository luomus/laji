/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { IucnClassComponent } from './iucn-class/iucn-class.component';
import { TaxonStatusHistoryComponent } from './taxon-status-history/taxon-status-history.component';
import { IucnStatusPipe } from './pipe/iucn-status.pipe';
import { IucnHyphensPipe } from './pipe/iucn-hyphens.pipe';
import { StatusMarkComponent } from './status-mark/status-mark.component';
import { ExplainCriteriaPipe } from './pipe/explain-criteria.pipe';
/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
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
