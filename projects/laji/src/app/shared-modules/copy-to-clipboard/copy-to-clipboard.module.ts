import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyToClipboardComponent } from './copy-to-clipboard.component';



@NgModule({
  declarations: [CopyToClipboardComponent],
  imports: [
    CommonModule,
  ],
  exports: [CopyToClipboardComponent]
})
export class CopyToClipboardModule { }
