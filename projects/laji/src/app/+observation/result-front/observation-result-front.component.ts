import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';

@Component({
    selector: 'laji-observation-result-front',
    templateUrl: './observation-result-front.component.html',
    styleUrls: ['./observation-result-front.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ObservationResultFrontComponent {
  @Input({ required: true }) query!: WarehouseQueryInterface;
}
