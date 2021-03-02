import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Habitat } from '../model/Taxonomy';

@Component({
  selector: 'laji-habitat',
  templateUrl: './habitat.component.html',
  styleUrls: ['./habitat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitatComponent {

  isMany: boolean;
  _habitat: Habitat;
  _habitats: Habitat[];

  @Input() set habitat(habitat: Habitat | Habitat[]) {
    if (Array.isArray(habitat)) {
      this.isMany = true;
      this._habitats = habitat;
    } else {
      this.isMany = false;
      this._habitat = habitat;
    }
  }

}
