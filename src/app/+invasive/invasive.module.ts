import { NgModule } from '@angular/core';
import { InvasiveComponent } from './invasive.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { routing } from './invasive.routes';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { LangModule } from '../shared-modules/lang/lang.module';

@NgModule({
  imports: [
    routing, SharedModule, RouterModule, DocumentViewerModule, LangModule
  ],
  declarations: [InvasiveComponent, InvasiveComponent]
})
export class InvasiveModule { }
