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
import { LabelFieldsAvailableComponent } from './label-editor-container/label-fields-available/label-fields-available.component';
import { LabelPageComponent } from './label-print/label-page/label-page.component';
import { FontSettingsComponent } from './label-editor-container/label-settings/font-settings/font-settings.component';
import { MarginSettingsComponent } from './label-editor-container/label-settings/margin-settings/margin-settings.component';
import { FieldSettingsComponent } from './label-editor-container/label-settings/field-settings/field-settings.component';
import { LabelFileComponent } from './label-editor-container/label-file/label-file.component';
import { FieldAddComponent } from './label-editor-container/label-settings/field-add/field-add.component';
import { SearchFieldsPipe } from './label-editor-container/label-fields-available/search-fields.pipe';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { RemoveSuffixPipe } from './label-editor-container/label-file/remove-suffix.pipe';
import { InfoWindowComponent } from './info-window/info-window.component';
import { IconComponent } from './icon/icon.component';

@NgModule({
  declarations: [
    LabelEditorContainerComponent,
    LabelPreviewComponent,
    LabelPrintComponent,
    LabelEditorComponent,
    EditorItemComponent,
    LabelItemComponent,
    RulerComponent,
    LabelSettingsComponent,
    LabelFieldsAvailableComponent,
    LabelPageComponent,
    FontSettingsComponent,
    MarginSettingsComponent,
    FieldSettingsComponent,
    LabelFileComponent,
    FieldAddComponent,
    SearchFieldsPipe,
    RemoveSuffixPipe,
    InfoWindowComponent,
    IconComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    QRCodeModule,
    NgxWebstorageModule
  ],
  exports: [LabelEditorContainerComponent, LabelPreviewComponent, LabelPrintComponent]
})
export class GenericLabelMakerModule { }
