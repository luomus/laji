import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-line-transect-result',
  templateUrl: './line-transect-result.component.html',
  styleUrls: ['./line-transect-result.component.css']
})
export class LineTransectResultComponent {
  public tab: string;
  informalTaxonGroup = 'MVL.1';
  defaultTaxonId = 'MX.37580';
  collectionId = 'HR.61,HR.2691';

  constructor() {}
}
