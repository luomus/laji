import { ChangeDetectorRef, Component, EventEmitter, Input, ChangeDetectionStrategy, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { SykeInsectResultService } from '../syke-insect-result.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Area } from '../../../../shared/model/Area';
import { toHtmlSelectElement } from '../../../../shared/service/html-element.service';


@Component({
  selector: 'laji-syke-insect-result-filters',
  templateUrl: './syke-insect-result-filters.component.html',
  styleUrls: ['./syke-insect-result-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SykeInsectResultFiltersComponent implements OnInit, OnChanges {

  @Input() yearRequired = false;
  @Input() showDateFilter = true;
  @Input() routeId;
  @Input() showSections = true;
  @Input() collectionId: string;

  years: number[] = [];
  days: string[] = [];

  activeYear: number;
  activeDate: string;
  activeArea: string;
  onlySections: boolean;

  @Output() yearChange = new EventEmitter<number>();
  @Output() dateChange = new EventEmitter<string>();
  @Output() areaChange = new EventEmitter<string>();
  @Output() switchSectionsYears = new EventEmitter<boolean>();

  toHtmlSelectElement = toHtmlSelectElement;

  constructor(
    private resultService: SykeInsectResultService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    this.onYearChange(params['year']);
    this.onDateChange(params['date']);
    this.onSectionsChange(params['onlySections']);

    this.getYears(this.routeId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.yearRequired && this.yearRequired && !this.activeYear && this.years) {
      this.onYearChange('' + this.years[0]);
    }

  }

  onYearChange(newYear: string) {
    this.activeYear = (newYear && newYear !== '0') ? parseInt(newYear, 10) : undefined;
    this.activeDate = undefined;
    this.yearChange.emit(this.activeYear);
    if (!this.activeYear) {
      this.onDateChange(undefined);
      this.onSectionsChange(true);
    } else {
      this.getYears(this.routeId);
      this.onSectionsChange(this.onlySections);
      this.onFiltersChange();
    }
  }

  getYears(routeId: string) {
    this.resultService.getYears(routeId, this.collectionId)
      .subscribe(
        years => {
          this.years = Object.keys(years).sort().reverse().map(el => parseInt(el, 10));
          this.days = years[this.activeYear];
          if (this.yearRequired && !this.activeYear) {
            this.onYearChange('' + years[0]);
          }
          this.cd.markForCheck();
        }
      );
  }

  onDateChange(newDate: string) {
    this.activeDate = (newDate && newDate !== '0') ? newDate : undefined;
    this.onlySections = true;
    this.dateChange.emit(newDate);
    this.onFiltersChange();
  }

  onSectionsChange(onlySections: any) {
   this.onlySections = onlySections !== undefined ?
   (typeof onlySections === 'object' ? JSON.parse(onlySections['currentValue']) :
   (typeof onlySections === 'string') ? JSON.parse(onlySections) : onlySections) : true;
   this.switchSectionsYears.emit(this.onlySections);
   this.onFiltersChange();
  }

  private onFiltersChange() {
    this.router.navigate(
      [],
      {
        queryParams: {year: this.activeYear, date: this.activeDate, onlySections: this.onlySections},
        queryParamsHandling: 'merge'
      }
    );

  }
}
