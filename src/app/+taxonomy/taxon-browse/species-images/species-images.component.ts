import { Component, OnInit, Input } from '@angular/core';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';

@Component({
  selector: 'laji-species-images',
  templateUrl: './species-images.component.html',
  styleUrls: ['./species-images.component.css']
})
export class SpeciesImagesComponent implements OnInit {
  @Input() searchQuery: TaxonomySearchQuery;

  constructor() { }

  ngOnInit() {
  }

}
