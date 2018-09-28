import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { AreaType } from '../../../../shared/service/area.service';
import { WbcResultService, SEASON } from '../wbc-result.service';

@Component({
  selector: 'laji-wbc-result-filters',
  templateUrl: './wbc-result-filters.component.html',
  styleUrls: ['./wbc-result-filters.component.css']
})
export class WbcResultFiltersComponent implements OnInit {
  @Input() yearRequired = false;
  @Input() showSeasonFilter = true;

  years: number[] = [];
  seasons: SEASON[] = ['fall', 'winter', 'spring'];
  areaTypes = AreaType;

  activeYear: string;

  @Output() yearChange = new EventEmitter<number>();
  @Output() seasonChange = new EventEmitter<SEASON>();
  @Output() areaChange = new EventEmitter<string>();

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.resultService.getYears()
      .subscribe(
        years => {
          this.years = years;
          if (this.yearRequired) {
            this.onYearChange('' + years[0]);
          }
          this.cd.markForCheck();
        }
      )
  }

  onYearChange(newYear: string) {
    this.activeYear = newYear;

    if (!newYear) {
      this.yearChange.emit(undefined);
      this.seasonChange.emit(undefined);
      return;
    }
    this.yearChange.emit(parseInt(newYear, 10));
  }
}
