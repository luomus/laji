import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { AtlasActivityCategory, AtlasActivityCategoryElement, AtlasApiService, AtlasSocietyStatsResponseElement } from '../../core/atlas-api.service';
import { TableColumn } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DatatableRow extends AtlasSocietyStatsResponseElement {
  [activityCategory: number]: string;
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
        prop: '0',
        name: 'Ei havaintoja',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: '1',
        name: 'Satunnaista',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: '2',
        name: 'Välttävä',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: '3',
        name: 'Tyydyttävä',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: '4',
        name: 'Hyvä',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: '5',
        name: 'Erinomainen',
        resizeable: false,
        sortable: true,
        width: 100
      },
      {
        prop: 'totalSquares',
        name: 'Yhteensä',
        resizeable: false,
        sortable: true,
        width: 100
      }
    ];
    this.rows$ = this.atlasApi.getBirdSocietyStats().pipe(
      map(societies => {
        const rows: DatatableRow[] = [];
        societies.forEach(society => {
          const row: DatatableRow | AtlasSocietyStatsResponseElement = society;
          Object.values(society.activityCategories).forEach((v, i) => {
            row[i] = v.squareSum + ` (${Math.round(v.squarePercentage)}%)`;
          });
          rows.push(<DatatableRow>row);
        });
        return rows;
      })
    );
    this.cdr.detectChanges();
  }

  onDownloadCsv(rows: DatatableRow[]) {
    const _rows = [
      [
        'Lintuyhdistys', 'Ei havaintoja', 'Satunnaista', 'Välttävä',
        'Tyydyttävä', 'Hyvä', 'Erinomainen', 'Yhteensä'
      ],
      ...rows.map(row => [
        row.birdAssociationArea.value,
        row[0], row[1], row[2], row[3], row[4], row[5],
        row.totalSquares
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,'
      + _rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }
}
