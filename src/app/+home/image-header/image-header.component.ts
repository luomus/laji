import { Component, OnInit } from '@angular/core';
import { HeaderImage, HeaderImageService } from 'app/shared/service/header-image.service';

@Component({
  selector: 'laji-image-header',
  templateUrl: './image-header.component.html',
  styleUrls: ['./image-header.component.css']
})
export class ImageHeaderComponent implements OnInit {
  headerImage: HeaderImage;

  constructor(private headerImageService: HeaderImageService) {}

  ngOnInit() {
    this.headerImage = this.headerImageService.getCurrentSeason();
  }
}
