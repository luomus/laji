import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AtlasApiService } from '../../core/atlas-api.service';
import { LoadedElementsStore } from 'projects/laji-ui/src/lib/tabs/tab-utils';

@Component({
  templateUrl: './grid-index.component.html',
  styleUrls: ['./grid-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexComponent implements OnInit {
  grid$ = this.atlasApi.getGrid();
  loadedElementsStore = new LoadedElementsStore(['map', 'table']);

  constructor(
    private atlasApi: AtlasApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadedElementsStore.load('map');
  }

  onSelectYKJ(ykj: string) {
    this.router.navigate([ykj], { relativeTo: this.route });
  }
}
