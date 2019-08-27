import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

@Component({
  selector: 'laji-image-header',
  templateUrl: './image-header.component.html',
  styleUrls: ['./image-header.component.css']
})
export class ImageHeaderComponent implements OnInit {
  season: Season;

  ngOnInit() {
    switch (moment().quarter()) {
      default: this.season = 'spring'; break;
      case 1: this.season = 'spring'; break;
      case 2: this.season = 'summer'; break;
      case 3: this.season = 'autumn'; break;
      case 4: this.season = 'winter'; break;
    }
  }
}
