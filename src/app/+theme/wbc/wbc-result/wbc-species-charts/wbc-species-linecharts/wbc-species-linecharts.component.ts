import { Component, OnInit, OnChanges, Input, ChangeDetectorRef } from '@angular/core';
import { WbcResultService, SEASON } from '../../wbc-result.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-wbc-species-linecharts',
  templateUrl: './wbc-species-linecharts.component.html',
  styleUrls: ['./wbc-species-linecharts.component.css']
})
export class WbcSpeciesLinechartsComponent implements OnInit, OnChanges {
  @Input() taxonId: string;
  @Input() taxonCensus = undefined;
  @Input() birdAssociationArea: string;

  lines: {[s: string]: {name: string, series: {name: number, value: number}[]}[]} = {};
  counts: any;

  xScaleMin: number;
  xScaleMax: number;
  yScaleMin = 0;
  yScaleMax = 0;

  colorScheme = {
    domain: ['steelblue']
  };

  resultSub: Subscription;

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.counts = undefined;
    if (this.taxonId) {
      if (this.resultSub) {
        this.resultSub.unsubscribe();
      }
      this.resultSub = this.resultService.getCountsByYearForSpecies(this.taxonId, this.birdAssociationArea, this.taxonCensus)
        .subscribe(data => {
          this.xScaleMin = undefined;
          this.xScaleMax = undefined;
          this.yScaleMax = 0;

          this.counts = data;
          this.setLines(data['fall'], 'fall', 'wbc.season.fall');
          this.setLines(data['winter'], 'winter', 'wbc.season.winter');
          this.setLines(data['spring'], 'spring', 'wbc.season.spring');

          this.cd.markForCheck();
        });
    }
  }

  private setLines(data: any, season: SEASON, label: string) {
    this.lines[season] = [];

    const years = Object.keys(data);
    years.sort();

    let prevYear;
    let series = [];
    for (let i = 0; i < years.length; i++) {
      const year = parseInt(years[i], 10);
      const value = data[years[i]].count / data[years[i]].censusCount;

      if (prevYear && year > prevYear + 1) {
        this.lines[season].push({name: label, series: series});
        series = [];
      }
      series.push({name: year, value: value});

      if (!this.xScaleMin || year < this.xScaleMin) {
        this.xScaleMin = year;
      }
      if (!this.xScaleMax || year > this.xScaleMax) {
        this.xScaleMax = year;
      }
      if (value > this.yScaleMax) {
        this.yScaleMax = value;
      }

      prevYear = year;
    }
    this.lines[season].push({name: label, series: series});
  }

  tickFormatting(val: number): string {
    if (val % 1 !== 0) {
      return '';
    }
    return '' + val;
  }
}
