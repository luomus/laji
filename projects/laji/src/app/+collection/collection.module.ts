import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CollectionComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
// import { CollectionTreeComponent } from './tree-collection/tree-collection.component';
// import { TreeModule } from 'angular-tree-component';
import { InfoCollectionComponent } from './info-collection/info-collection.component';
import { LangModule } from '../shared-modules/lang/lang.module';

@NgModule({
  imports: [routing, SharedModule, RouterModule, LangModule],
  declarations: [CollectionComponent, InfoCollectionComponent]
})
export class CollectionModule {
}
