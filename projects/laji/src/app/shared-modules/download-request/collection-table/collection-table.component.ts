import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Collection } from '../../../shared/model/Collection';
import { DatatableColumn } from '../../datatable/model/datatable-column';

@Component({
  selector: 'laji-collection-table',
  templateUrl: './collection-table.component.html',
  styleUrls: ['./collection-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionTableComponent {
  @Input() collections: Collection[] = [];

  columns: DatatableColumn[] = [
    {
      name: 'collectionName',
      label: 'collection.collectionName',
      width: 200
    },
    {
      name: 'id',
      label: 'collection.id',
      cellTemplate: 'fullUriLink'
    },
    {
      name: 'intellectualRights',
      label: 'collection.intellectualRights',
      cellTemplate: 'label'
    },
    {
      name: 'personResponsible',
      label: 'collection.personResponsible'
    },
    {
      name: 'contactEmail',
      label: 'collection.contactEmail'
    }
  ];
}
