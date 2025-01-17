import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { LocaleModule } from '../locale/locale.module';
import { SharedModule } from '../shared/shared.module';
import { TraitDbBrowseComponent } from './trait-db-browse/trait-db-browse.component';
import { TraitDbMainComponent } from './trait-db-main/trait-db-main.component';
import { TraitDbMyDatasetsComponent } from './shared/trait-db-my-datasets/trait-db-my-datasets.component';
import { TraitDbComponent } from './trait-db.component';
import { routing } from './trait-db.routes';
import { TraitDbDatasetsComponent } from './trait-db-datasets/trait-db-datasets.component';
import { TraitDbDatasetComponent } from './trait-db-datasets/trait-db-dataset/trait-db-dataset.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TraitDbNewDatasetComponent } from './trait-db-datasets/trait-db-new-dataset/trait-db-new-dataset.component';
import { TraitDbAboutComponent } from './trait-db-about/trait-db-about.component';
import { TraitDbTraitsComponent } from './trait-db-traits/trait-db-traits.component';
import { TraitDbTraitComponent } from './trait-db-traits/trait-db-trait/trait-db-trait.component';
import { DatatableModule } from 'projects/laji-ui/src/lib/datatable/datatable.module';
import { TraitSearchComponent } from './shared/trait-search/trait-search.component';
import { TraitSearchFiltersComponent } from './shared/trait-search/trait-search-filters/trait-search-filters.component';
import { TraitSearchAdditionalFiltersComponent } from './shared/trait-search/trait-search-filters/additional-filters.component';

@NgModule({
  imports: [ routing, CommonModule, SharedModule, LajiUiModule, ReactiveFormsModule, DatatableModule ],
  declarations: [
    TraitDbComponent, TraitDbMainComponent, TraitDbBrowseComponent,
    TraitDbMyDatasetsComponent, TraitDbDatasetsComponent, TraitDbDatasetComponent,
    TraitDbNewDatasetComponent, TraitDbAboutComponent, TraitDbTraitsComponent,
    TraitDbTraitComponent, TraitSearchComponent, TraitSearchFiltersComponent, TraitSearchAdditionalFiltersComponent
  ]
})
export class TraitDbModule {}

