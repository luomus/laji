import { Component, OnInit, Input } from '@angular/core';
import { TaxonomyImage } from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-images',
  templateUrl: './taxon-images.component.html',
  styleUrls: ['./taxon-images.component.scss']
})
export class TaxonImagesComponent implements OnInit {
  @Input() taxonImages: Array<TaxonomyImage>;

  constructor() { }

  ngOnInit() {
  }

}
