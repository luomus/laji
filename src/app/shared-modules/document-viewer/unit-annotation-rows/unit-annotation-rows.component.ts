import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-unit-annotation-rows',
  templateUrl: './unit-annotation-rows.component.html',
  styleUrls: ['./unit-annotation-rows.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnitAnnotationRowsComponent {
  @Input() unit: any;
  @Input() showFacts = false;
  @Input() showLinks = true;

  constructor() { }

}
