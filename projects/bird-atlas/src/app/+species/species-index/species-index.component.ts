import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AtlasApiService } from '../../core/atlas-api.service';

@Component({
  selector: 'ba-species-index',
  templateUrl: './species-index.component.html',
  styleUrls: ['./species-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesIndexComponent {
  speciesList$ = this.atlasApi.getTaxa();

  constructor(private atlasApi: AtlasApiService) {}
}
