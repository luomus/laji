import { NgModule } from '@angular/core';
import { LabelEditorComponent } from './label-editor/label-editor.component';
import { LabelPreviewComponent } from './label-preview/label-preview.component';
import { LabelPrintComponent } from './label-print/label-print.component';
import { EditorComponent } from './label-editor/editor/editor.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { EditorItemComponent } from './label-editor/editor/editor-item/editor-item.component';

@NgModule({
  declarations: [LabelEditorComponent, LabelPreviewComponent, LabelPrintComponent, EditorComponent, EditorItemComponent],
  imports: [
    CommonModule,
    DragDropModule
  ],
  exports: [LabelEditorComponent, LabelPreviewComponent, LabelPrintComponent]
})
export class GenericLabelMakerModule { }
