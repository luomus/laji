import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { ObservationActiveComponent } from './active/observation-active.component';
import { SharedModule } from '../../shared/shared.module';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { LajiSelectModule } from '../select/select.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LajiSelectModule
  ],
  declarations: [MetadataSelectComponent, ObservationActiveComponent, SearchFiltersComponent],
  exports: [MetadataSelectComponent, SearchFiltersComponent]
})
export class SearchFiltersModule { }
