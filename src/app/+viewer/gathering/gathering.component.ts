import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'laji-gathering',
  templateUrl: './gathering.component.html',
  styleUrls: ['./gathering.component.css']
})
export class GatheringComponent implements OnInit {

  @Input() gathering: any;
  mapData = [];

  constructor() { }

  ngOnInit() {
    this.updateMapData();
  }

  updateMapData() {
    this.mapData = [];
    if (this.gathering.conversions && this.gathering.conversions.wgs84Geo) {
      this.mapData.push(this.gathering.conversions.wgs84Geo);
    }
  }

}
