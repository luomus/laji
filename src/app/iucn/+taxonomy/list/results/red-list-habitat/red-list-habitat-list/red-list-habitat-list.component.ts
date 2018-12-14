import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResultService } from '../../../../../iucn-shared/service/result.service';

@Component({
  selector: 'laji-red-list-habitat-list',
  templateUrl: './red-list-habitat-list.component.html',
  styleUrls: ['./red-list-habitat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListHabitatListComponent {

  statuses: string[];
  statusLabel: any;

  constructor(
    private resultService: ResultService
  ) {
    this.statuses = this.resultService.statuses;
    this.statusLabel = this.resultService.shortLabel;
  }

}
