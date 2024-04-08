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

@NgModule({
  imports: [ routing, CommonModule, SharedModule, LajiUiModule ],
  declarations: [
    TraitDbComponent, TraitDbMainComponent, TraitDbBrowseComponent,
    TraitDbMyDatasetsComponent, TraitDbDatasetsComponent, TraitDbDatasetComponent ]
})
export class TraitDbModule {}

