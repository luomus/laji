import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import { CollectionComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [routing, SharedModule, RouterModule],
  declarations: [CollectionComponent]
})
export class CollectionModule {}
