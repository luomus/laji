import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxonomy.component.html',
  styleUrls: ['./taxonomy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonomyComponent {
  constructor() { }
}
