import { Component } from '@angular/core';

import { NavigationThumbnailComponent, NewsListComponent } from '../shared';
import { ImageHeaderComponent } from './image-header';
import {OmniSearchComponent} from "../shared/omni-search/omni-search.component";
import {SearchQuery} from "../+observation/search-query.model";
import {NewsApi} from "../shared/api/NewsApi";

@Component({
  selector: 'laji-home',
  pipes: [],
  providers: [
    SearchQuery,
    NewsApi
  ],
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
