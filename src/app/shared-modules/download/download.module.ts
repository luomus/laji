import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download.component';
import { SpinnerModule } from '../spinner/spinner.module';
import { ModalModule } from 'ngx-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DownloadComponent],
  imports: [
    SpinnerModule,
    ModalModule,
    TranslateModule,
    FormsModule,
    CommonModule
  ],
  exports: [DownloadComponent]
})
export class DownloadModule { }
