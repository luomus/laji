import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { FileDownloadComponent } from './file-download/file-download.component';
import { DownloadRequestComponent } from './download-request/download-request.component';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { CopyToClipboardModule } from '../copy-to-clipboard/copy-to-clipboard.module';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LajiUiModule,
    CopyToClipboardModule,
    InfoModule
  ],
  declarations: [FileDownloadComponent, DownloadRequestComponent],
  exports: [DownloadRequestComponent]
})
export class DownloadRequestModule { }
