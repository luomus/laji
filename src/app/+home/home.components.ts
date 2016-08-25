import { Component } from '@angular/core';

import { NavigationThumbnailComponent, NewsListComponent } from '../shared';
import { ImageHeaderComponent } from './image-header';
import {OmniSearchComponent} from "../shared/omni-search/omni-search.component";

@Component({
  selector: 'laji-home',
  pipes: [],
  providers: [],
  directives: [
    ImageHeaderComponent,
    NavigationThumbnailComponent,
    NewsListComponent,
    OmniSearchComponent
  ],
  styleUrls: ['./home.component.css'],
  templateUrl: './home.component.html'
})
export class HomeComponent {}
