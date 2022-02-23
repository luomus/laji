import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { routing } from './species.routes';
import { SpeciesIndexComponent } from './species-index/species-index.component';
import { SpeciesInfoComponent } from './species-info/species-info.component';
import { RouterModule } from '@angular/router';
import { SpeciesComponent } from './species.component';

@NgModule({
  declarations: [SpeciesIndexComponent, SpeciesInfoComponent, SpeciesComponent],
  imports: [
    routing,
    CommonModule,
    TranslateModule,
    RouterModule
  ]
})
export class SpeciesModule { }
