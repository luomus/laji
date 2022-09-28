import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { TreeSelectModule } from '../tree-select/tree-select.module';
import { DatasetMetadataComponent } from './dataset-metadata.component';
import { DatasetMetadataViewerComponent } from './dataset-metadata-viewer/dataset-metadata-viewer.component';
import { DatasetMetadataViewerItemComponent } from './dataset-metadata-viewer/dataset-metadata-viewer-item/dataset-metadata-viewer-item.component';
import { DatasetMetadataBrowserComponent } from './dataset-metadata-browser/dataset-metadata-browser.component';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { DocumentViewerModule } from '../document-viewer/document-viewer.module';
import { SelectModule } from '../select/select.module';
import { DatasetMetadataViewerMultilangItemComponent } from './dataset-metadata-viewer/dataset-metadata-viewer-multilang-item/dataset-metadata-viewer-multilang-item.component';

@NgModule({
  imports: [
    SharedModule,
    TreeSelectModule,
    LajiUiModule,
    SelectModule,
    DocumentViewerModule
  ],
  declarations: [
    DatasetMetadataComponent,
    DatasetMetadataViewerComponent,
    DatasetMetadataViewerItemComponent,
    DatasetMetadataBrowserComponent,
    DatasetMetadataViewerMultilangItemComponent
   ],
  exports: [
    DatasetMetadataComponent,
  ],
})
export class DatasetMetadataModule { }