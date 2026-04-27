import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { DatatableColumn } from '../../datatable/model/datatable-column';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Collection = components['schemas']['SensitiveCollection'];

@Component({
    selector: 'laji-collection-table',
    templateUrl: './collection-table.component.html',
    styleUrls: ['./collection-table.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
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
