import { NgModule } from '@angular/core';
import { LabelMakerComponent } from './label-maker/label-maker.component';
import { LabelPreviewComponent } from './label-preview/label-preview.component';
import { LabelPrintComponent } from './label-print/label-print.component';
import { LabelEditorComponent } from './label-maker/label-editor/label-editor.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { EditorItemComponent } from './label-maker/label-editor/editor-item/editor-item.component';
import { LabelItemComponent } from './label-preview/label-item/label-item.component';
import { QRCodeModule } from 'angularx-qrcode';
import { RulerComponent } from './ruler/ruler.component';
import { LabelSettingsComponent } from './label-maker/label-settings/label-settings.component';
import { LabelFieldsAvailableComponent } from './label-maker/label-fields-available/label-fields-available.component';
import { LabelPageComponent } from './label-print/label-page/label-page.component';
import { FontSettingsComponent } from './label-maker/label-settings/font-settings/font-settings.component';
import { MarginSettingsComponent } from './label-maker/label-settings/margin-settings/margin-settings.component';
import { FieldSettingsComponent } from './label-maker/label-settings/field-settings/field-settings.component';
import { LabelFileComponent } from './label-maker/label-file/label-file.component';
import { FieldAddComponent } from './label-maker/label-settings/field-add/field-add.component';
import { SearchFieldsPipe } from './label-maker/label-fields-available/search-fields.pipe';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { RemoveSuffixPipe } from './label-maker/label-file/remove-suffix.pipe';
import { InfoWindowComponent } from './info-window/info-window.component';
import { IconComponent } from './icon/icon.component';
import { ViewSettingsComponent } from './label-maker/view-settings/view-settings.component';
import { EditorGridComponent } from './label-maker/label-editor/editor-grid/editor-grid.component';
import { LabelItemFieldComponent } from './label-preview/label-item/label-item-field/label-item-field.component';

@NgModule({
  declarations: [
    LabelMakerComponent,
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
    IconComponent,
    ViewSettingsComponent,
    EditorGridComponent,
    LabelItemFieldComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    QRCodeModule,
    NgxWebstorageModule
  ],
  exports: [LabelMakerComponent, LabelPreviewComponent, LabelPrintComponent]
})
export class GenericLabelMakerModule { }
