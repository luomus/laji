import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'laji-taxon-name',
  templateUrl: './taxon-name.component.html',
  styleUrls: ['./taxon-name.component.css']
})
export class TaxonNameComponent implements OnInit {

  @Input() taxon: {
    id: string;
    cursiveName?: boolean;
    scientificName?: string;
    vernacularName?: string;
    scientificNameAuthorship?: string;
  };
  @Input() taxonID: string;
  @Input() addLink = true;
  @Input() warningOnMissingTaxonID = false;

  constructor() { }

  ngOnInit() {
  }

}
