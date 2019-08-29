import { Component, OnInit } from '@angular/core';
import { SeasonService, Season } from 'app/shared/service/season.service';

@Component({
  selector: 'laji-image-header',
  templateUrl: './image-header.component.html',
  styleUrls: ['./image-header.component.css']
})
export class ImageHeaderComponent implements OnInit {
  season: Season;

  constructor(private seasonService: SeasonService) {}

  ngOnInit() {
    this.season = this.seasonService.getCurrentSeason();
  }
}
