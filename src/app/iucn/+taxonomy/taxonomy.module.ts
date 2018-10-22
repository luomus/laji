import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoCardComponent } from './info-card/info-card.component';
import { TaxonomyComponent } from './taxonomy.component';
import { ListComponent } from './list/list.component';
import { routing } from './taxonomy.routes';
import { SharedModule } from '../../shared/shared.module';
import { TaxonImageComponent } from './info-card/taxon-image/taxon-image.component';
import { TaxonStatusComponent } from './info-card/taxon-status/taxon-status.component';
import { IucnStatusPipe } from './pipe/iucn-status.pipe';
import { TaxonStatusHistoryComponent } from './info-card/taxon-status-history/taxon-status-history.component';
import { RedlistYearSelectComponent } from './info-card/redlist-year-select/redlist-year-select.component';

@NgModule({
  imports: [
    routing,
    CommonModule,
    SharedModule
  ],
  declarations: [InfoCardComponent, TaxonomyComponent, ListComponent, TaxonImageComponent, TaxonStatusComponent, IucnStatusPipe, TaxonStatusHistoryComponent, RedlistYearSelectComponent]
})
export class TaxonomyModule { }
