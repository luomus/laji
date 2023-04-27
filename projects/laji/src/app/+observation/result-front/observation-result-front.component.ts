import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Component({
  selector: 'laji-observation-result-front',
  templateUrl: './observation-result-front.component.html',
  styleUrls: ['./observation-result-front.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationResultFrontComponent {
  @Input() query: WarehouseQueryInterface;
}
