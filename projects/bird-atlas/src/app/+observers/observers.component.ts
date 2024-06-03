import { TableColumn } from '@achimha/ngx-datatable';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { forkJoin, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface Teams {
  [name: string]: { all: number; B: number; C: number; D: number };
}

interface Row {
  name: string;
  all: number;
  B: number;
  C: number;
  D: number;
}

@Component({
  templateUrl: './observers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObserversComponent implements OnInit {
  rows$: Observable<Row[]>;
  cols: TableColumn[] = [
    { prop: 'name', name: 'Nimi' },
    { prop: 'all', name: 'Kaikki' },
    { prop: 'D', name: 'Varma' },
    { prop: 'C', name: 'Todennäköinen' },
    { prop: 'B', name: 'Mahdollinen' }
  ];
  loading = true;

  constructor(private warehouseApi: WarehouseApi, private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    this.loading = true;
    this.cdr.markForCheck();
    this.rows$ = forkJoin(['MY.atlasClassEnumB', 'MY.atlasClassEnumC', 'MY.atlasClassEnumD'].map(
      atlasClass => this.warehouseApi.warehouseQueryAggregateGet({
        collectionId: ['HR.1747', 'HR.3211', 'HR.48', 'HR.173'],
        informalTaxonGroupId: ['MVL.1'],
        countryId: ['ML.206'],
        time: '2022-01-01/2025-12-31',
        recordQuality: ['COMMUNITY_VERIFIED', 'NEUTRAL', 'EXPERT_VERIFIED'],
        atlasClass: [atlasClass],
        needsCheck: false
      }, ['gathering.team']).pipe(map(res => res.results))
    )).pipe(
      map(arr => {
        const teams: Teams = {};
        const updateTeam = (res: any[], atlasClass: 'B' | 'C' | 'D') =>
          res.forEach(entry => {
            const team: string = entry['aggregateBy']['gathering.team'];
            if (!(team in teams)) {
              teams[team] = { all: 0, B: 0, C: 0, D: 0 };
            }
            teams[team][atlasClass] += entry['count'];
            teams[team].all += entry['count'];
          });
        updateTeam(arr[2], 'D');
        updateTeam(arr[1], 'C');
        updateTeam(arr[0], 'B');
        return <Row[]>Object.entries(teams).map(([name, attrs]) => ({ name, ...attrs }));
      }),
      tap(_ => this.loading = false)
    );
  }
}

