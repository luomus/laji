import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AtlasApiService, AtlasGrid } from '../../core/atlas-api.service';
import { LoadedElementsStore } from 'projects/laji-ui/src/lib/tabs/tab-utils';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ScrollPositionService } from '../../core/scroll-position.service';

@Component({
  templateUrl: './grid-index.component.html',
  styleUrls: ['./grid-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexComponent implements OnInit {
  grid$: Observable<AtlasGrid>;
  loadedElementsStore = new LoadedElementsStore(['map', 'table']);

  constructor(
    private atlasApi: AtlasApiService,
    private router: Router,
    private route: ActivatedRoute,
    private scroll: ScrollPositionService
  ) {}

  ngOnInit(): void {
    this.grid$ = this.atlasApi.getGrid().pipe(tap(() => {
      this.scroll.recallScrollPosition();
    }));
    this.loadedElementsStore.load('map');
  }

  onSelectYKJ(ykj: string) {
    this.router.navigate([ykj], { relativeTo: this.route });
  }
}
