import { Component, OnInit } from '@angular/core';
import { HomeDataService, IHomeData } from '../home-data.service';
import { Observable } from 'rxjs';
import { HeaderImage, HeaderImageService } from '../../shared/service/header-image.service';

@Component({
  selector: 'laji-image-header',
  templateUrl: './image-header.component.html',
  styleUrls: ['./image-header.component.css']
})
export class ImageHeaderComponent implements OnInit {
  headerImage: HeaderImage;
  homeData$: Observable<IHomeData>;

  constructor(
    private headerImageService: HeaderImageService,
    private homeDataService: HomeDataService
  ) {}

  ngOnInit() {
    this.headerImage = this.headerImageService.getCurrentSeason();
    this.homeData$ = this.homeDataService.getHomeData();
  }
}
