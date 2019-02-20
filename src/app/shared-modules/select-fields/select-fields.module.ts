import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectFieldsComponent } from './select-fields/select-fields.component';
import { SelectFieldsModalGearComponent } from './select-fields-modal-gear/select-fields-modal-gear.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SharedModule } from '../../shared/shared.module';
import { RemoveByListPipe } from './remove-by-list.pipe';

@NgModule({
  declarations: [SelectFieldsComponent, SelectFieldsModalGearComponent, RemoveByListPipe],
  imports: [
    CommonModule,
    DragDropModule,
    SharedModule
  ],
  exports: [SelectFieldsComponent, SelectFieldsModalGearComponent]
})
export class SelectFieldsModule { }
