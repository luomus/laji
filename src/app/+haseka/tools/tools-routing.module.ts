import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsComponent } from './tools.component';
import { ImporterComponent } from './importer/importer.component';
import { ExcelGeneratorComponent } from './excel-generator/excel-generator.component';
import { LabelDesignerComponent } from './label-designer/label-designer.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ToolsComponent },
  { path: 'import', pathMatch: 'full', component: ImporterComponent},
  { path: 'generate', pathMatch: 'full', component: ExcelGeneratorComponent},
  { path: 'label', pathMatch: 'full', component: LabelDesignerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
