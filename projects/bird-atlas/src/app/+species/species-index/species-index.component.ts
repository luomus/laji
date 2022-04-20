import { ChangeDetectionStrategy, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AtlasApiService } from '../../core/atlas-api.service';
import { ScrollPositionService } from '../../core/scroll-position.service';

@Component({
  selector: 'ba-species-index',
  templateUrl: './species-index.component.html',
  styleUrls: ['./species-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesIndexComponent {
  speciesList$ = this.atlasApi.getTaxa().pipe(tap(() => {
    this.scroll.recallScrollPosition();
  }));

  constructor(private atlasApi: AtlasApiService, private scroll: ScrollPositionService) {}
}
