import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'laji-gathering',
  templateUrl: './gathering.component.html',
  styleUrls: ['./gathering.component.css']
})
export class GatheringComponent implements OnInit, OnChanges {

  @Input() gathering: any;
  @Input() highlight: string;
  @Input() visible = true;
  mapData = [];

  constructor() { }

  ngOnInit() {
    this.updateMapData();
  }

  ngOnChanges() {
    this.updateMapData();
  }

  updateMapData() {
    this.mapData = [];
    if (this.gathering.conversions && this.gathering.conversions.wgs84Geo) {
      this.mapData.push(this.gathering.conversions.wgs84Geo);
    }
  }

}
