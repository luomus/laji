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
  _habitat: Habitat | Habitat[];

  constructor() { }

  @Input() set habitat(habitat: Habitat | Habitat[]) {
    this.isMany = Array.isArray(habitat);
    this._habitat = habitat;
  }

}
