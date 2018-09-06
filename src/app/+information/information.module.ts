import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './information.routes';
import { InformationComponent } from './information.component';
import { InformationStore } from './information.store';

@NgModule({
  imports: [routing, SharedModule, RouterModule],
  providers: [InformationStore],
  declarations: [InformationComponent],
})
export class InformationModule {
}
