import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-red-list-habitat',
  templateUrl: './red-list-habitat.component.html',
  styleUrls: ['./red-list-habitat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListHabitatComponent {

  constructor() { }

  @Input()
  set data(data: any) {

  }

}
