import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { HomeDataService } from '../+home/home-data.service';


@NgModule({
  imports: [routing, SharedModule, RouterModule],
  declarations: [NewsComponent],
  providers: [HomeDataService]
})
export class NewsModule {
}
