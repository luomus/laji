import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { IucnArea, RegionalService } from '../../../../iucn-shared/service/regional.service';
import { RedListRegionalStatusData } from '../regional-results.component';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-red-list-regional-status',
  templateUrl: './red-list-regional-status.component.html',
  styleUrls: ['./red-list-regional-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListRegionalStatusComponent implements OnInit, OnDestroy {

  _data: RedListRegionalStatusData[] = [];
  areas: IucnArea[] = [];

  @Output() groupSelect = new EventEmitter<string>();

  @Input()
  set data(data: RedListRegionalStatusData[]) {
    this._data = data || [];
    this.updateData(this._data);
  }

  private areaSub?: Subscription;

  constructor(
    private resultService: RegionalService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.areaSub = this.resultService.getAreas(this.translate.currentLang).subscribe(areas => {
      this.areas = areas;
      this.updateData(this._data);
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.areaSub) {
      this.areaSub.unsubscribe();
    }
  }

  rowClick(group: string) {
    if (!group) {
      return;
    }
    this.groupSelect.emit(group);
  }

  updateData(data: RedListRegionalStatusData[]) {
    if (!data || data.length === 0 || !this.areas) {
      return;
    }
    const total: RedListRegionalStatusData = { species: 'Total', count: 0 };
    this.areas.forEach(area => {
      total[area.id] = 0;
    });
    const results = data.map(row => {
      this.areas.forEach(area => {
        if (row[area.id]) {
          (total[area.id] as number) += row[area.id] as number;
        }
      });
      total.count += row.count;
      return row;
    });
    if (results.length > 1) {
      results.unshift(total);
    }
    results.push(total);
    this._data = results;
  }
}
