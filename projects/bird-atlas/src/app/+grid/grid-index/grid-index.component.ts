import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableColumn } from '@swimlane/ngx-datatable';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';

interface DatatableRow {
  ykj: string;
  name: string;
  id: string;
}

@Component({
  selector: 'ba-grid-index',
  templateUrl: './grid-index.component.html',
  styleUrls: ['./grid-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexComponent {
  rows: DatatableRow[] = [
    {
      ykj: '123:123',
      name: 'Ruudun nimi',
      id: '123456'
    },
    {
      ykj: '123:123',
      name: 'Ruutu 2',
      id: '123456'
    },
    {
      ykj: '123:123',
      name: 'Ruutu 3',
      id: '123456'
    }
  ];
  cols: TableColumn[] = [{
    prop: 'ykj',
    name: 'YKJ',
    resizeable: false,
    sortable: true
  }, {
    prop: 'name',
    name: 'Nimi',
    resizeable: false,
    sortable: true
  }];
  datatableClasses = datatableClasses;

  constructor(private router: Router, private route: ActivatedRoute) {}

  onActivate(event: { type: string; row: DatatableRow }) {
    if(event.type === 'click') {
      this.router.navigate([event.row.id], { relativeTo: this.route });
    }
  }
}
