import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InformationComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { InformationService } from './information.service';

@NgModule({
  imports: [routing, SharedModule, RouterModule],
  providers: [InformationService],
  declarations: [InformationComponent]
})
export class InformationModule {
}
