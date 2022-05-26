import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AtlasApiService } from '../../core/atlas-api.service';

@Component({
  templateUrl: 'bird-society-index.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyIndexComponent {
  birdSocieties$ = this.atlasApi.getBirdSocieties();
  constructor(private atlasApi: AtlasApiService) {}
}
