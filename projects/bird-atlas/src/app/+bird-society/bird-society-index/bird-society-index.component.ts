import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { AtlasActivityCategory, AtlasActivityCategoryElement, AtlasApiService, AtlasSocietyStatsResponseElement } from '../../core/atlas-api.service';
import { TableColumn } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DatatableRow extends AtlasSocietyStatsResponseElement {
  [activityCategory: number]: string;
  targetPercentageString: string;
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
        width: 75
      },
      {
        prop: 'targetPercentageString',
        name: 'Tavoitteesta saavutettu %',
        resizeable: false,
        sortable: true
      }
    ];
    this.rows$ = this.atlasApi.getBirdSocietyStats().pipe(
      map(societies => {
        const rows: DatatableRow[] = [];
        societies.forEach(society => {
          const row: DatatableRow = <DatatableRow>society;
          Object.values(society.activityCategories).forEach((v, i) => {
            row[i] = v.squareSum + ` (${Math.round(v.squarePercentage)}%)`;
          });
          row.targetPercentageString = Math.round(row.targetPercentage) + '%';
          rows.push(row);
        });
        return rows;
      })
    );
    this.cdr.detectChanges();
  }

  onDownloadCsv(rows: DatatableRow[]) {
    const _rows = [
      [
        'Lintuyhdistys',
        'Ei havaintoja', 'Satunnaista', 'Välttävä',
        'Tyydyttävä', 'Hyvä', 'Erinomainen',
        'Yhteensä',
        'Tavoitteesta saavutettu %',
        'Ei havaintoja %', 'Satunnaista %', 'Välttävä %',
        'Tyydyttävä %', 'Hyvä %', 'Erinomainen %',
      ],
      ...rows.map(row => [
        row.birdAssociationArea.value,
        ...Object.values(row.activityCategories).map(
          c => c.squareSum
        ),
        row.totalSquares,
        Math.round(row.targetPercentage),
        ...Object.values(row.activityCategories).map(
          c => Math.round(c.squarePercentage)
        )
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,'
      + _rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }
}
