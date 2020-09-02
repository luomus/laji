import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download.component';
import { SpinnerModule } from '../spinner/spinner.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { LajiUiModule } from '../../../../projects/laji-ui/src/lib/laji-ui.module';
import { SelectModule } from '../select/select.module';

@NgModule({
  declarations: [DownloadComponent],
  imports: [
    SpinnerModule,
    ModalModule,
    TranslateModule,
    FormsModule,
    CommonModule,
    LajiUiModule,
    SelectModule
  ],
  exports: [DownloadComponent]
})
export class DownloadModule { }
