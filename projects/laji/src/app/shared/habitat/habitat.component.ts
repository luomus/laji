import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Habitat = components['schemas']['HabitatObject'];

@Component({
  selector: 'laji-habitat',
  templateUrl: './habitat.component.html',
  styleUrls: ['./habitat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitatComponent {

  isMany?: boolean;
  _habitat?: Habitat;
  _habitats?: Habitat[];

  @Input() set habitat(habitat: Habitat | Habitat[] | undefined) {
    if (Array.isArray(habitat)) {
      this.isMany = true;
      this._habitats = habitat;
    } else {
      this.isMany = false;
      this._habitat = habitat;
    }
  }

}
