import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SEASON, WbcResultService } from '../wbc-result.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Area } from '../../../../shared/model/Area';

@Component({
  selector: 'laji-wbc-result-filters',
  templateUrl: './wbc-result-filters.component.html',
  styleUrls: ['./wbc-result-filters.component.css']
})
export class WbcResultFiltersComponent implements OnInit, OnChanges {
  @Input() yearRequired = false;
  @Input() showSeasonFilter = true;
  @Input() showAreaFilter = true;

  years: number[] = [];
  seasons: SEASON[] = ['fall', 'winter', 'spring'];
  areaTypes = Area.AreaType;

  activeYear: number;
  activeSeason: SEASON;
  activeArea: string;

  @Output() yearChange = new EventEmitter<number>();
  @Output() seasonChange = new EventEmitter<SEASON>();
  @Output() areaChange = new EventEmitter<string>();

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.onYearChange(params['year']);
    this.onSeasonChange(params['season']);
    this.onAreaChange(params['birdAssociationArea']);

    this.resultService.getYears()
      .subscribe(
        years => {
          this.years = years;
          if (this.yearRequired && !this.activeYear) {
            this.onYearChange('' + years[0]);
          }
          this.cd.markForCheck();
        }
      );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.yearRequired && this.yearRequired && !this.activeYear && this.years.length > 0) {
      this.onYearChange('' + this.years[0]);
    }
  }

  onYearChange(newYear: string) {
    this.activeYear = newYear ? parseInt(newYear, 10) : undefined;
    this.yearChange.emit(this.activeYear);
    if (!this.activeYear) {
      this.onSeasonChange(undefined);
    } else {
      this.onFiltersChange();
    }
  }

  onSeasonChange(newSeason: SEASON) {
    this.activeSeason = newSeason;
    this.seasonChange.emit(newSeason);
    this.onFiltersChange();
  }

  onAreaChange(newArea: string) {
    if (newArea === 'all') {
      newArea = undefined;
    }
    this.activeArea = newArea;
    this.areaChange.emit(newArea);
    this.onFiltersChange();
  }

  private onFiltersChange() {
    this.router.navigate(
      [],
      {
        queryParams: {year: this.activeYear, season: this.activeSeason, birdAssociationArea: this.activeArea},
        queryParamsHandling: 'merge'
      }
    );
  }
}
