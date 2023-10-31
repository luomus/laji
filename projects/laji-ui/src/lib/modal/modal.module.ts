import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal/modal.component';
import { LajiUiModule } from '../laji-ui.module';

@NgModule({
  declarations: [
    ModalComponent
  ],
  imports: [
    CommonModule,
    LajiUiModule
  ],
  exports: [
    ModalComponent,
  ],
})
export class ModalModule { }
