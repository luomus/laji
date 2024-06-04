import { TableColumn } from '@achimha/ngx-datatable';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WarehouseApi } from 'projects/laji/src/app/shared/api/WarehouseApi';
import { forkJoin, Observable } from 'rxjs';
import { tap, map, switchMap, startWith } from 'rxjs/operators';
import { AtlasApiService, KeyValueObject } from '../core/atlas-api.service';

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
  areaControl = new FormControl<string>('all');
  rows$: Observable<Row[]>;
  societies$: Observable<KeyValueObject<string, string>[]>;
  cols: TableColumn[] = [
    { prop: 'name', name: 'Nimi' },
    { prop: 'all', name: 'Kaikki' },
    { prop: 'D', name: 'Varma' },
    { prop: 'C', name: 'Todennäköinen' },
    { prop: 'B', name: 'Mahdollinen' }
  ];
  loadingRows = true;

  constructor(private warehouseApi: WarehouseApi, private atlasApi: AtlasApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.rows$ = this.areaControl.valueChanges.pipe(
      startWith(this.areaControl.value),
      tap(_ => {
        this.loadingRows = true;
        this.cdr.markForCheck();
      }),
      switchMap(area =>
        forkJoin(['MY.atlasClassEnumB', 'MY.atlasClassEnumC', 'MY.atlasClassEnumD'].map(
          atlasClass => this.warehouseApi.warehouseQueryAggregateGet({
            collectionId: ['HR.1747', 'HR.3211', 'HR.48', 'HR.173'],
            informalTaxonGroupId: ['MVL.1'],
            countryId: ['ML.206'],
            time: '2022-01-01/2025-12-31',
            recordQuality: ['COMMUNITY_VERIFIED', 'NEUTRAL', 'EXPERT_VERIFIED'],
            atlasClass: [atlasClass],
            needsCheck: false,
            birdAssociationAreaId: area !== 'all' ? [area] : undefined
          }, ['gathering.team']).pipe(map(res => res.results))
        ))
      ),
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
      tap(_ => this.loadingRows = false)
    );

    this.societies$ = this.atlasApi.getBirdSocieties();
  }
}

