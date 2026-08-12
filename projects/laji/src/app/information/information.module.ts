import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './information.routes';
import { InformationComponent } from './information.component';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { TechnicalNewsModule } from '../shared-modules/technical-news/technical-news.module';

@NgModule({
  imports: [routing, SharedModule, RouterModule, LajiUiModule, TechnicalNewsModule],
  declarations: [InformationComponent],
})
export class InformationModule {}
