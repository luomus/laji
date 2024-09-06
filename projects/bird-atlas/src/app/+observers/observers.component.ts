import { TableColumn } from '@achimha/ngx-datatable';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { tap, map, switchMap, startWith } from 'rxjs/operators';
import { AtlasApiService, KeyValueObject, ObserverStatsParams } from '../core/atlas-api.service';

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

  constructor(private atlasApi: AtlasApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.rows$ = this.areaControl.valueChanges.pipe(
      startWith(this.areaControl.value),
      tap(_ => {
        this.loadingRows = true;
        this.cdr.markForCheck();
      }),
      switchMap(area => {
        const observerStatsOptions: ObserverStatsParams = { limit: 100 };
        if (area && area !== 'all') {
          observerStatsOptions.birdAssociationId = area;
        }
        return this.atlasApi.getObserverStats(observerStatsOptions);
      }),
      map(res =>
        res.map(o => ({
          name: o.memberName,
          all: o.total,
          B: o['MY.atlasClassEnumB'] ?? 0,
          C: o['MY.atlasClassEnumC'] ?? 0,
          D: o['MY.atlasClassEnumD'] ?? 0
        }))
      ),
      tap(_ => this.loadingRows = false)
    );

    this.societies$ = this.atlasApi.getBirdSocieties();
  }
}

