import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableColumn } from '@swimlane/ngx-datatable';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';
import { AtlasApiService, AtlasGridQueryElem } from '../../core/atlas-api.service';

@Component({
  selector: 'ba-grid-index',
  templateUrl: './grid-index.component.html',
  styleUrls: ['./grid-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexComponent {
  rows$ = this.atlasApi.getGrid();
  cols: TableColumn[] = [{
    prop: 'coordinates',
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

  constructor(private router: Router, private route: ActivatedRoute, private atlasApi: AtlasApiService) {}

  onActivate(event: { type: string; row: AtlasGridQueryElem }) {
    if(event.type === 'click') {
      this.router.navigate([event.row.coordinates], { relativeTo: this.route });
    }
  }
}
