import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IGlobalSite } from '../../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-site-table',
  templateUrl: './site-table.component.html',
  styleUrls: ['./site-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteTableComponent {
  @Input() sites: IGlobalSite[] = [];
  @Input() height = '100%';

  columns = [
    {
      name: 'id',
      label: 'Id',
      width: 59
    },
    {
      name: 'name',
      label: 'Name',
      width: 150
    },
    {
      name: 'country',
      label: 'Country',
      width: 150
    },
  ];

}
