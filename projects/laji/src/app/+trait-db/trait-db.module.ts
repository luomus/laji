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
import { TraitDbDatasetEditorComponent } from './trait-db-datasets/trait-db-dataset-editor/trait-db-dataset-editor.component';
import { TraitDbAboutComponent } from './trait-db-about/trait-db-about.component';
import { TraitDbTraitsComponent } from './trait-db-traits/trait-db-traits.component';
import { TraitDbTraitComponent } from './trait-db-traits/trait-db-trait/trait-db-trait.component';
import { DatatableModule } from 'projects/laji-ui/src/lib/datatable/datatable.module';
import { TraitSearchComponent } from './shared/trait-search/trait-search.component';
import { TraitSearchFiltersComponent } from './shared/trait-search/trait-search-filters/trait-search-filters.component';
import { TraitSearchAdditionalFiltersComponent } from './shared/trait-search/trait-search-filters/additional-filters.component';
import { TraitDbTraitEditorComponent } from './trait-db-traits/trait-db-trait-editor/trait-db-trait-editor.component';
import { TraitEnumerationValueListComponent } from './trait-db-traits/trait-db-trait-editor/trait-enumeration-value-list.component';
import { TraitDbTraitGroupEditorComponent } from './trait-db-traits/trait-db-trait-group-editor/trait-db-trait-group-editor.component';
import { TraitDbDataEntryComponent } from './trait-db-datasets/data-entry/trait-db-data-entry.component';
import { TraitDbDataEntryImportComponent } from './trait-db-datasets/data-entry/import/data-entry-import.component';
import { TraitDbDataEntryValidateComponent } from './trait-db-datasets/data-entry/validate/data-entry-validate.component';
import { TraitDbDataEntryCheckComponent } from './trait-db-datasets/data-entry/check/data-entry-check.component';
import { TraitDbDataEntryReadyComponent } from './trait-db-datasets/data-entry/ready/data-entry-ready.component';

@NgModule({
  imports: [ routing, CommonModule, SharedModule, LajiUiModule, ReactiveFormsModule, DatatableModule ],
  declarations: [
    TraitDbComponent, TraitDbMainComponent, TraitDbBrowseComponent,
    TraitDbMyDatasetsComponent, TraitDbDatasetsComponent, TraitDbDatasetComponent,
    TraitDbDatasetEditorComponent, TraitDbAboutComponent, TraitDbTraitsComponent,
    TraitDbTraitComponent, TraitSearchComponent, TraitSearchFiltersComponent, TraitSearchAdditionalFiltersComponent,
    TraitDbTraitEditorComponent, TraitEnumerationValueListComponent, TraitDbTraitGroupEditorComponent, TraitDbDataEntryComponent,
    TraitDbDataEntryImportComponent, TraitDbDataEntryValidateComponent, TraitDbDataEntryCheckComponent, TraitDbDataEntryReadyComponent
  ]
})
export class TraitDbModule {}

