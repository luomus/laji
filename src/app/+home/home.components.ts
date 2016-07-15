import { Component } from '@angular/core';

import { NavigationThumbnailComponent, NewsListComponent } from '../shared';
import { SearchBarComponent } from './search-bar';
import { ImageHeaderComponent } from './image-header';

@Component({
  selector: 'laji-home',
  pipes: [],
  providers: [],
  directives: [ SearchBarComponent, ImageHeaderComponent, NavigationThumbnailComponent, NewsListComponent],
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent {}
