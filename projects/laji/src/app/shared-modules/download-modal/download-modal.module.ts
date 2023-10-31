import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download.component';
import { SpinnerModule } from '../spinner/spinner.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { SelectModule } from '../select/select.module';
import { ApikeyModalComponent } from './apikey-modal/apikey-modal.component';
import { ReasonComponent } from './reason/reason.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { CopyToClipboardModule } from '../copy-to-clipboard/copy-to-clipboard.module';
import { ModalModule } from 'projects/laji-ui/src/lib/modal/modal.module';
import { TooltipModule } from 'projects/laji-ui/src/lib/tooltip/tooltip.module';

@NgModule({
  declarations: [DownloadComponent, ApikeyModalComponent, ReasonComponent],
  imports: [
    SpinnerModule,
    ModalModule,
    TranslateModule,
    FormsModule,
    CommonModule,
    RouterModule,
    SharedModule,
    LajiUiModule,
    SelectModule,
    TooltipModule,
    CopyToClipboardModule
  ],
  exports: [DownloadComponent, ApikeyModalComponent]
})
export class DownloadModalModule { }
