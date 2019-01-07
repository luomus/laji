import { NgModule } from '@angular/core';
import { LabelEditorContainerComponent } from './label-editor-container/label-editor-container.component';
import { LabelPreviewComponent } from './label-preview/label-preview.component';
import { LabelPrintComponent } from './label-print/label-print.component';
import { LabelEditorComponent } from './label-editor-container/label-editor/label-editor.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { EditorItemComponent } from './label-editor-container/label-editor/editor-item/editor-item.component';
import { LabelItemComponent } from './label-preview/label-item/label-item.component';
import { QRCodeModule } from 'angularx-qrcode';
import { RulerComponent } from './ruler/ruler.component';
import { LabelSettingsComponent } from './label-editor-container/label-settings/label-settings.component';

@NgModule({
  declarations: [
    LabelEditorContainerComponent,
    LabelPreviewComponent,
    LabelPrintComponent,
    LabelEditorComponent,
    EditorItemComponent,
    LabelItemComponent,
    RulerComponent,
    LabelSettingsComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    QRCodeModule
  ],
  exports: [LabelEditorContainerComponent, LabelPreviewComponent, LabelPrintComponent]
})
export class GenericLabelMakerModule { }
