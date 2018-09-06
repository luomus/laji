import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-unit-rows',
  templateUrl: './unit-rows.component.html',
  styleUrls: ['./unit-rows.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitRowsComponent {
  @Input() unit: any;
  @Input() showFacts = false;
  @Input() showLinks = true;

  constructor() { }

}
