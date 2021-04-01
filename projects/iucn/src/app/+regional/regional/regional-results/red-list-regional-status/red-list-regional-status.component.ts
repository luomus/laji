import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { IucnArea, RegionalService } from '../../../../iucn-shared/service/regional.service';
import { RedListRegionalStatusData } from '../regional-results.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-red-list-regional-status',
  templateUrl: './red-list-regional-status.component.html',
  styleUrls: ['./red-list-regional-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListRegionalStatusComponent implements OnInit {

  _data: RedListRegionalStatusData[] = [];
  areas: IucnArea[] = [];

  @Output() groupSelect = new EventEmitter<string>();

  @Input()
  set data(data: RedListRegionalStatusData[]) {
    this._data = data || [];
    this.updateData(this._data);
  }

  constructor(
    private resultService: RegionalService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.resultService.getAreas(this.translate.currentLang).subscribe(areas => {
      this.areas = areas;
      this.updateData(this._data);
      this.cdr.markForCheck();
    });
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
      this.setRowValue(total, area.id as keyof RedListRegionalStatusData, 0);
    });
    const results = data.map(row => {
      this.areas.forEach(area => {
        const id = area.id as keyof RedListRegionalStatusData;
        const value = row[id];
        if (value) {
          this.setRowValue(total, id, value);
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

  private setRowValue<K extends keyof RedListRegionalStatusData, T extends RedListRegionalStatusData[K]>(data: RedListRegionalStatusData, field: K, value: T) {
    data[field] = value;
  }
}
