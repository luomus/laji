import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsComponent } from './tools.component';
import { ExcelGeneratorComponent } from './excel-generator/excel-generator.component';
import { LabelDesignerComponent } from './label-designer/label-designer.component';
import { ImportContainerComponent } from './importer/import-container.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ToolsComponent },
  { path: 'import', pathMatch: 'full', component: ImportContainerComponent},
  { path: 'generate', pathMatch: 'full', component: ExcelGeneratorComponent},
  { path: 'label', pathMatch: 'full', component: LabelDesignerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
