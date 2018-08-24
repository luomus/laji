import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsComponent } from './tools.component';
import { ImporterComponent } from './importer/importer.component';
import { ExcelGeneratorComponent } from './excel-generator/excel-generator.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: ToolsComponent },
  { path: 'import', pathMatch: 'full', component: ImporterComponent},
  { path: 'generate', pathMatch: 'full', component: ExcelGeneratorComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
