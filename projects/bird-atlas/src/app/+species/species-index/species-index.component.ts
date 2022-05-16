import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AtlasApiService, AtlasTaxa } from '../../core/atlas-api.service';
import { ScrollPositionService } from '../../core/scroll-position.service';

@Component({
  templateUrl: './species-index.component.html',
  styleUrls: ['./species-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesIndexComponent implements OnInit {
  speciesList$: Observable<AtlasTaxa>;

  constructor(private atlasApi: AtlasApiService, private scroll: ScrollPositionService) {}

  ngOnInit(): void {
    this.speciesList$ = this.atlasApi.getTaxa().pipe(tap(() => {
      this.scroll.recallScrollPosition();
    }));
  }
}
