import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { WarehouseQueryInterface } from '../../shared/model/WarehouseQueryInterface';
import { DataFetchMode } from '../observation-data.service';

@Component({
    selector: 'laji-observation-result-front',
    templateUrl: './observation-result-front.component.html',
    styleUrls: ['./observation-result-front.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ObservationResultFrontComponent {
  @Input() dataMode: DataFetchMode = 'unit';
  @Input({ required: true }) query!: WarehouseQueryInterface;
}
