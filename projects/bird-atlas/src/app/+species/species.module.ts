import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { routing } from './species.routes';
import { SpeciesIndexComponent } from './species-index/species-index.component';
import { SpeciesInfoComponent } from './species-info/species-info.component';
import { RouterModule } from '@angular/router';
import { SpeciesComponent } from './species.component';
import { LangModule } from '../../../../laji/src/app/shared-modules/lang/lang.module';
import { SpinnerModule } from '../../../../laji/src/app/shared-modules/spinner/spinner.module';
import { SpeciesIndexListComponent } from './species-index/species-index-list/species-index-list.component';

@NgModule({
  declarations: [SpeciesIndexComponent, SpeciesInfoComponent, SpeciesComponent, SpeciesIndexListComponent],
  imports: [
    routing,
    CommonModule,
    TranslateModule,
    RouterModule,
    LangModule,
    SpinnerModule
  ]
})
export class SpeciesModule { }
