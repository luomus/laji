import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { AtlasApiService } from '../../core/atlas-api.service';
import { TableColumn } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DatatableRow {
  id: string;
  society: string;
  cat1: number;
  cat2: number;
  cat3: number;
  cat4: number;
  cat5: number;
  cat6: number;
  cat7: number;
}

@Component({
  templateUrl: 'bird-society-index.component.html',
  styleUrls: ['bird-society-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyIndexComponent implements AfterViewInit {
  @ViewChild('societyName') societyNameTemplate: TemplateRef<any>;

  rows$: Observable<DatatableRow[]>;
  cols: TableColumn[];
  constructor(private atlasApi: AtlasApiService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cols = [
      {
        prop: 'society',
        name: 'Lintuyhdistys',
        resizeable: false,
        sortable: true,
        width: 300,
        cellTemplate: this.societyNameTemplate
      },
      {
        prop: 'cat1',
        name: 'Ei havaintoja',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: 'cat2',
        name: 'Satunnaista',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: 'cat3',
        name: 'Välttävä',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: 'cat4',
        name: 'Tyydyttävä',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: 'cat5',
        name: 'Hyvä',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: 'cat6',
        name: 'Erinomainen',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: 'cat7',
        name: 'Yhteensä',
        resizeable: false,
        sortable: true,
        width: 100
      }
    ];
    this.rows$ = this.atlasApi.getBirdSocieties().pipe(
      map(societies => {
        const rows: DatatableRow[] = [];
        societies.forEach(society => {
          rows.push({
            id: society.key,
            society: society.value,
            cat1: 0,
            cat2: 0,
            cat3: 0,
            cat4: 0,
            cat5: 0,
            cat6: 0,
            cat7: 0
          });
        });
        return rows;
      })
    );
    this.cdr.detectChanges();
  }
}
