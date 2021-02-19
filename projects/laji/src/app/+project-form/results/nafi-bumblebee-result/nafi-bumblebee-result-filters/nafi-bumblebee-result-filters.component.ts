import { ChangeDetectorRef, Component, EventEmitter, Input, ChangeDetectionStrategy, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { YearDays, NafiBumblebeeResultService } from '../nafi-bumblebee-result.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Area } from '../../../../shared/model/Area';


@Component({
  selector: 'laji-nafi-bumblebee-result-filters',
  templateUrl: './nafi-bumblebee-result-filters.component.html',
  styleUrls: ['./nafi-bumblebee-result-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeResultFiltersComponent implements OnInit, OnChanges {

  @Input() yearRequired = false;
  @Input() showDateFilter = true;
  @Input() routeId;

  years: string[] = [];
  days: string[] = [];
  areaTypes = Area.AreaType;

  activeYear: number;
  activeDate: string;
  activeArea: string;

  @Output() yearChange = new EventEmitter<number>();
  @Output() dateChange = new EventEmitter<string>();
  @Output() areaChange = new EventEmitter<string>();

  constructor(
    private resultService: NafiBumblebeeResultService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.onYearChange(params['year']);
    this.onDateChange(params['date']);

    this.getYears(this.routeId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.yearRequired && this.yearRequired && !this.activeYear && this.years[this.activeYear].length > 0) {
      this.onYearChange('' + this.years[0]);
    }
  }

  onYearChange(newYear: string) {
    this.activeYear = newYear ? parseInt(newYear, 10) : undefined;
    this.activeDate = undefined;
    this.yearChange.emit(this.activeYear);
    if (!this.activeYear) {
      this.onDateChange(undefined);
    } else {
      this.getYears(this.routeId);
      this.onFiltersChange();
    }
  }

  getYears(routeId: string) {
    this.resultService.getYears(routeId)
      .subscribe(
        years => {
          this.years = Object.keys(years).sort().reverse();
          this.days = years[this.activeYear];
          if (this.yearRequired && !this.activeYear) {
            this.onYearChange('' + years[0]);
          }
          this.cd.markForCheck();
        }
      );
  }

  onDateChange(newDate: string) {
    this.activeDate = newDate;
    this.dateChange.emit(newDate);
    this.onFiltersChange();
  }

  private onFiltersChange() {
    this.router.navigate(
      [],
      {
        queryParams: {year: this.activeYear, date: this.activeDate},
        queryParamsHandling: 'merge'
      }
    );

  }
}
