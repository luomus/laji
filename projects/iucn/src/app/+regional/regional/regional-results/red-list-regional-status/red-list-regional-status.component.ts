import {Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnInit, ChangeDetectorRef} from '@angular/core';
import {IucnArea, RegionalService} from '../../../../iucn-shared/service/regional.service';
import {RedListStatusData} from '../../../../+taxonomy/list/results/red-list-status/red-list-status.component';
import {TranslateService} from '@ngx-translate/core';

export interface RedListRegionalStatusData {
  species: string;
  count: number;
  group?: string;
  'ML.690'?: number;
  'ML.691'?: number;
  'ML.692'?: number;
  'ML.693'?: number;
  'ML.694'?: number;
  'ML.695'?: number;
  'ML.696'?: number;
  'ML.697'?: number;
  'ML.698'?: number;
  'ML.699'?: number;
  'ML.700'?: number;
}

@Component({
  selector: 'laji-red-list-regional-status',
  templateUrl: './red-list-regional-status.component.html',
  styleUrls: ['./red-list-regional-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListRegionalStatusComponent implements OnInit {

  _data: RedListStatusData[] = [];
  areas: IucnArea[];

  @Output() groupSelect = new EventEmitter<string>();

  @Input()
  set data(data: RedListStatusData[]) {
    this.updateData(data);
  }

  constructor(
    private resultService: RegionalService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.resultService.getAreas(this.translate.currentLang).subscribe(areas => {
      this.areas = areas;
      this.updateData(this.data);
      this.cdr.markForCheck();
    });
  }

  rowClick(group) {
    if (!group) {
      return;
    }
    this.groupSelect.emit(group);
  }

  updateData(data: RedListStatusData[]) {
    if (!data || !this.areas) {
      this._data = [];
      return;
    }
    const total: RedListStatusData = { species: 'Total', count: 0 };
    this.areas.forEach(area => {
      total[area.id] = 0;
    });
    const results = data.map<RedListRegionalStatusData>(row => {
      this.areas.forEach(area => {
        if (row[area.id]) {
          total[area.id] += row[area.id];
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
