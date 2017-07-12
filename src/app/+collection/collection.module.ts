import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CollectionComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { CollectionTreeComponent } from './tree-collection/tree-collection.component';
import { TreeModule } from 'angular-tree-component';
import { InfoCollectionComponent } from './info-collection/info-collection.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, TreeModule],
  declarations: [CollectionComponent, CollectionTreeComponent, InfoCollectionComponent]
})
export class CollectionModule {
}
