import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { WbcResultService } from '../../wbc-result.service';

@Component({
  selector: 'laji-wbc-species-result-linecharts',
  templateUrl: './wbc-species-result-linecharts.component.html',
  styleUrls: ['./wbc-species-result-linecharts.component.css']
})
export class WbcSpeciesResultLinechartsComponent implements OnInit, OnChanges {
  @Input() taxonId: string;
  @Input() taxonCensus = undefined;
  @Input() birdAssociationArea: string;

  lines1: {name: string, series: {name: string, value: number}[]}[] = [];

  constructor(
    private resultService: WbcResultService
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.taxonId) {
      this.resultService.getCountPerCensusByYear(this.taxonId, this.birdAssociationArea, this.taxonCensus)
        .subscribe(data => {
          this.lines1 = [{name: 'Spring', series: data['fall']}];
          console.log(this.lines1);
        })
    }
  }
}
