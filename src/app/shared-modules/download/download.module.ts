import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download.component';
import { SpinnerModule } from '../spinner/spinner.module';
import { ModalModule } from 'ngx-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { LajiUiModule } from '../../../../projects/laji-ui/src/lib/laji-ui.module';

@NgModule({
  declarations: [DownloadComponent],
  imports: [
    SpinnerModule,
    ModalModule,
    TranslateModule,
    FormsModule,
    CommonModule,
    LajiUiModule
  ],
  exports: [DownloadComponent]
})
export class DownloadModule { }
