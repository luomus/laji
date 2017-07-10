import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CollectionComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { InfoComponent } from './info/info.component';
import { CollectionTreeComponent } from './tree-collection/tree-collection.component';
import { TreeModule } from 'angular-tree-component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, TreeModule],
  declarations: [CollectionComponent, InfoComponent, CollectionTreeComponent]
})
export class CollectionModule {
}
