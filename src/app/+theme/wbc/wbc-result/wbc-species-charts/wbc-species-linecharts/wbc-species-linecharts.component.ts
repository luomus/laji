import { Component, OnInit, OnChanges, Input, ChangeDetectorRef } from '@angular/core';
import { WbcResultService } from '../../wbc-result.service';
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

  lines1: {name: string, series: {name: number, value: number}[]}[] = [];
  lines2: {name: string, series: {name: number, value: number}[]}[] = [];
  lines3: {name: string, series: {name: number, value: number}[]}[] = [];

  xScaleMin: number;
  xScaleMax: number;
  yScaleMin = 0;
  yScaleMax = 0;

  colorScheme = {
    domain: ['steelblue']
  };

  loading = false;
  resultSub: Subscription;

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.loading = true;
    if (this.taxonId) {
      if (this.resultSub) {
        this.resultSub.unsubscribe();
      }
      this.resultSub = this.resultService.getCountPerCensusByYear(this.taxonId, this.birdAssociationArea, this.taxonCensus)
        .subscribe(data => {
          this.xScaleMin = undefined;
          this.xScaleMax = undefined;
          this.yScaleMax = 0;

          this.setLines(1, data['fall'], 'Syksy');
          this.setLines(2, data['winter'], 'Talvi');
          this.setLines(3, data['spring'], 'Kevät');

          this.loading = false;
          this.cd.markForCheck();
        })
    }
  }

  private setLines(nbr: number, data: any[], label: string) {
    this['lines' + nbr] = [];

    let prevYear;
    let series = [];
    for (let i = 0; i < data.length; i++) {
      const year = data[i].name;
      if (prevYear && year > prevYear + 1) {
        this['lines' + nbr].push({name: label, series: series});
        series = [];
      }
      series.push(data[i]);
      if (data[i].value > this.yScaleMax) {
        this.yScaleMax = data[i].value;
      }
      prevYear = year;
    }
    this['lines' + nbr].push({name: label, series: series});

    if (data.length > 0) {
      if (!this.xScaleMin || data[0].name < this.xScaleMin) {
        this.xScaleMin = data[0].name;
      }
      if (!this.xScaleMax || data[data.length - 1].name > this.xScaleMax) {
        this.xScaleMax = data[data.length - 1].name;
      }
    }
  }

  tickFormatting(val: number): string {
    return val + '/' + (val + 1);
  }
}
