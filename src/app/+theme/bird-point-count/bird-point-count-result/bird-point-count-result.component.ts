import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'laji-bird-point-count-result',
  templateUrl: './bird-point-count-result.component.html',
  styleUrls: ['./bird-point-count-result.component.scss']
})
export class BirdPointCountResultComponent implements OnInit {

  informalTaxonGroup = 'MVL.1';
  defaultTaxonId = 'MX.37580';
  collectionId = 'HR.157';

  constructor() { }

  ngOnInit() {
  }

}
