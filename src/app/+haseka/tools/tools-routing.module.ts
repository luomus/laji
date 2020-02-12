import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsComponent } from './tools.component';
import { LabelDesignerComponent } from './label-designer/label-designer.component';
import { SheetGeneratorComponent } from './sheet-generator/sheet-generator.component';
import { SheetImporterComponent } from './sheet-importer/sheet-importer.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ToolsComponent },
  { path: 'import', pathMatch: 'full', component: SheetImporterComponent},
  { path: 'generate', pathMatch: 'full', component: SheetGeneratorComponent},
  { path: 'label', pathMatch: 'full', component: LabelDesignerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
