import { NgModule } from '@angular/core';
import { CitableDownloadComponent } from './citable-download.component';
import { routing } from './citable-download.routes';

@NgModule({
  imports: [
    routing,
  ],
  providers: [],
  declarations: [CitableDownloadComponent]
})
export class CitableDownloadModule { }
