import { NgModule } from '@angular/core';

import { NewsComponent }   from './news.component';
import { routing } from './news.routes';
import {SharedModule} from "../shared/shared.module";
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [routing, SharedModule, RouterModule],
  declarations: [NewsComponent]
})
export class NewsModule {}
