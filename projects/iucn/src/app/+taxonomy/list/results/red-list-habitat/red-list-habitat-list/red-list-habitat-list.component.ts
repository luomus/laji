import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ResultService } from '../../../../../iucn-shared/service/result.service';
import { RedListHabitatData } from '../red-list-habitat.component';
import { StatusCnt } from '../red-list-habitat.component';

@Component({
  selector: 'iucn-red-list-habitat-list',
  templateUrl: './red-list-habitat-list.component.html',
  styleUrls: ['./red-list-habitat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListHabitatListComponent {

  @Input() data: RedListHabitatData[] = [];
  @Output() habitatSelect = new EventEmitter<string>();

  statuses: (keyof StatusCnt)[];
  statusLabel: any;

  constructor(
    private resultService: ResultService
  ) {
    this.statuses = this.resultService.habitatStatuses as (keyof StatusCnt)[];
    this.statusLabel = this.resultService.shortLabel;
  }

  rowSelect(value: any) {
    if (!value) {
      return;
    }
    this.habitatSelect.emit(value);
  }

}
