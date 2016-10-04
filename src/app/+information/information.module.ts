import {NgModule} from '@angular/core';
import {RouterModule} from "@angular/router";

import { InformationComponent, routing } from './index';
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [routing, SharedModule, RouterModule],
  declarations: [InformationComponent]
})
export class InformationModule {}
