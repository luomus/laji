import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { AtlasActivityCategory, AtlasActivityCategoryElement, AtlasApiService, AtlasSocietyStatsResponseElement } from '../../core/atlas-api.service';
import { TableColumn } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface DatatableRow extends AtlasSocietyStatsResponseElement {
  [activityCategory: number]: AtlasActivityCategoryElement;
  targetPercentageString: string;
}

const createActivityCategoryComparator = (activityCategory: AtlasActivityCategory) => (
  (a: any, b: any, rowA: DatatableRow, rowB: DatatableRow, dir: 'asc' | 'desc') => {
    const valA = rowA.activityCategories?.[activityCategory]?.squareSum ?? 0;
    const valB = rowB.activityCategories?.[activityCategory]?.squareSum ?? 0;
    return valB - valA;
  }
);

const targetPercentageComparator = (a: any, b: any, rowA: DatatableRow, rowB: DatatableRow, dir: 'asc' | 'desc') => {
  const valA = rowA.targetPercentage ?? 0;
  const valB = rowB.targetPercentage ?? 0;
  return valB - valA;
};

@Component({
  templateUrl: 'bird-society-index.component.html',
  styleUrls: ['bird-society-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyIndexComponent implements AfterViewInit {
  @ViewChild('societyName') societyNameTemplate: TemplateRef<any>;
  @ViewChild('alignRight') alignRightTemplate: TemplateRef<any>;
  @ViewChild('activityCategoryCell') activityCategoryCellTemplate: TemplateRef<any>;

  rows$: Observable<DatatableRow[]>;
  cols: TableColumn[];
  round = Math.round;
  constructor(private atlasApi: AtlasApiService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.cols = [
      {
        prop: 'birdAssociationArea.value',
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
        width: 100,
        cellTemplate: this.activityCategoryCellTemplate,
        comparator: createActivityCategoryComparator('MY.atlasActivityCategoryEnum0')
      },
      {
        prop: '1',
        name: 'Satunnainen',
        resizeable: false,
        sortable: true,
        width: 100,
        cellTemplate: this.activityCategoryCellTemplate,
        comparator: createActivityCategoryComparator('MY.atlasActivityCategoryEnum1')
      },
      {
        prop: '2',
        name: 'Välttävä',
        resizeable: false,
        sortable: true,
        width: 100,
        cellTemplate: this.activityCategoryCellTemplate,
        comparator: createActivityCategoryComparator('MY.atlasActivityCategoryEnum2')
      },
      {
        prop: '3',
        name: 'Tyydyttävä',
        resizeable: false,
        sortable: true,
        width: 100,
        cellTemplate: this.activityCategoryCellTemplate,
        comparator: createActivityCategoryComparator('MY.atlasActivityCategoryEnum3')
      },
      {
        prop: '4',
        name: 'Hyvä',
        resizeable: false,
        sortable: true,
        width: 100,
        cellTemplate: this.activityCategoryCellTemplate,
        comparator: createActivityCategoryComparator('MY.atlasActivityCategoryEnum4')
      },
      {
        prop: '5',
        name: 'Erinomainen',
        resizeable: false,
        sortable: true,
        width: 100,
        cellTemplate: this.activityCategoryCellTemplate,
        comparator: createActivityCategoryComparator('MY.atlasActivityCategoryEnum5')
      },
      {
        prop: 'totalSquares',
        name: 'Yhteensä',
        resizeable: false,
        sortable: true,
        width: 75,
        cellTemplate: this.alignRightTemplate
      },
      {
        prop: 'targetPercentageString',
        name: 'Tavoitteesta saavutettu',
        resizeable: false,
        sortable: true,
        cellTemplate: this.alignRightTemplate,
        comparator: targetPercentageComparator
      }
    ];
    this.rows$ = this.atlasApi.getBirdSocietyStats().pipe(
      map(societies => {
        const rows: DatatableRow[] = [];
        societies.forEach(society => {
          const row: DatatableRow = <DatatableRow>society;
          Object.values(society.activityCategories).forEach((v, i) => {
            // row[i] = v.squareSum + ` (${Math.round(v.squarePercentage)}%)`;
            row[i] = v;
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
        'Ei havaintoja', 'Satunnainen', 'Välttävä',
        'Tyydyttävä', 'Hyvä', 'Erinomainen',
        'Yhteensä',
        'Tavoitteesta saavutettu %',
        'Ei havaintoja %', 'Satunnainen %', 'Välttävä %',
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
    const csvContent = 'data:text/csv;charset=utf-8,' + _rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }

  selectRowClass(row: DatatableRow) {
    return {
      'aggregate-row': !row.birdAssociationArea?.key
    };
  }
}
