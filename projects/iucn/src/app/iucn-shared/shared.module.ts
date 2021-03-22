import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { SimpleOmniComponent } from './component/simple-omni/simple-omni.component';
import { TaxonSelectModule } from '../../../../laji/src/app/shared-modules/taxon-select/taxon-select.module';
import {SelectComponent} from './component/select/select.component';
import {ActiveFiltersComponent} from './component/active-filters/active-filters.component';
import {PillListModule} from '../../../../laji/src/app/shared-modules/pill-list/pill-list.module';
import { MultiSelectComponent } from './component/multi-select/multi-select.component';
import {FiltersComponent} from './component/filters/filters.component';
import {RedListClassFilterComponent} from './component/filters/red-list-class-filter/red-list-class-filter.component';
import {LajiUiModule} from '../../../../laji-ui/src/lib/laji-ui.module';
import { SpeciesTableComponent } from './component/species-table/species-table.component';
import { SelectFieldsModule } from '../../../../laji/src/app/shared-modules/select-fields/select-fields.module';
import { DownloadModule } from '../../../../laji/src/app/shared-modules/download/download.module';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { RedListSpeciesComponent } from '../iucn-shared/component/species-table/red-list-species/red-list-species.component';
import { IucnCommonModule } from '../../../../laji/src/app/shared-modules/iucn/iucn.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    TaxonSelectModule,
    PillListModule,
    LajiUiModule,
    SelectFieldsModule,
    DownloadModule,
    DatatableModule,
    IucnCommonModule
  ],
  declarations: [
    SimpleOmniComponent,
    SelectComponent,
    ActiveFiltersComponent,
    MultiSelectComponent,
    FiltersComponent,
    RedListClassFilterComponent,
    SpeciesTableComponent,
    RedListSpeciesComponent
  ],
  exports: [
    SimpleOmniComponent,
    SelectComponent,
    ActiveFiltersComponent,
    MultiSelectComponent,
    FiltersComponent,
    SpeciesTableComponent
  ]
})
export class IucnSharedModule { }
