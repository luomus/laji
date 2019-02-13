import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ResultService } from '../../../../../iucn-shared/service/result.service';
import { RedListHabitatData } from '../red-list-habitat.component';

@Component({
  selector: 'laji-red-list-habitat-list',
  templateUrl: './red-list-habitat-list.component.html',
  styleUrls: ['./red-list-habitat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListHabitatListComponent {

  @Input() data: RedListHabitatData[] = [];

  statuses: string[];
  statusLabel: any;

  constructor(
    private resultService: ResultService
  ) {
    this.statuses = this.resultService.habitatStatuses;
    this.statusLabel = this.resultService.shortLabel;
  }

}
