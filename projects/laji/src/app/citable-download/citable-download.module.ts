import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CitableDownloadComponent } from './citable-download.component';
import { routing } from './citable-download.routes';
import { DownloadRequestModule } from '../shared-modules/download-request/download-request.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    SharedModule,
    DownloadRequestModule,
  ],
  providers: [DownloadRequestModule],
  declarations: [CitableDownloadComponent]
})
export class CitableDownloadModule { }
