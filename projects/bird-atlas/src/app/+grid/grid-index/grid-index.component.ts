import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AtlasApiService, AtlasGridResponse } from '../../core/atlas-api.service';
import { LoadedElementsStore } from 'projects/laji-ui/src/lib/tabs/tab-utils';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PopstateService } from '../../core/popstate.service';

@Component({
  templateUrl: './grid-index.component.html',
  styleUrls: ['./grid-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexComponent implements OnInit {
  grid$!: Observable<AtlasGridResponse>;
  loadedElementsStore = new LoadedElementsStore(['map', 'table']);

  constructor(
    private atlasApi: AtlasApiService,
    private router: Router,
    private route: ActivatedRoute,
    private popstateService: PopstateService
  ) {}

  ngOnInit(): void {
    this.grid$ = this.atlasApi.getGrid().pipe(tap(() => {
      this.popstateService.recallScrollPosition();
    }));
    this.loadedElementsStore.load('map');
  }

  onSelectYKJ(ykj: string) {
    this.router.navigate([ykj], { relativeTo: this.route });
  }

  onDownloadCsv(grid: AtlasGridResponse) {
    const cols = [
      'YKJ-ruudun koordinaatit', 'Nimi', 'Pesimävarmuussumma', 'Selvitysaste'
    ];
    const rows = grid.gridSquares.map(square => [
      square.coordinates, `"${square.name}"`, square.atlasClassSum, square.activityCategory!.value
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [cols.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }
}
