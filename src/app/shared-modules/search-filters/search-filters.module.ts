import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from './select/select.component';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { ObservationActiveComponent } from './active/observation-active.component';
import { SharedModule } from '../../shared/shared.module';
import { SearchFiltersComponent } from './search-filters/search-filters.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [SelectComponent, MetadataSelectComponent, ObservationActiveComponent, SearchFiltersComponent],
  exports: [MetadataSelectComponent, SearchFiltersComponent]
})
export class SearchFiltersModule { }
