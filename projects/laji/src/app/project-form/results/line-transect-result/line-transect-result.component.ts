import { Component } from '@angular/core';

@Component({
    selector: 'laji-line-transect-result',
    templateUrl: './line-transect-result.component.html',
    styleUrls: ['./line-transect-result.component.css'],
    standalone: false
})
export class LineTransectResultComponent {
  public tab?: string;
  informalTaxonGroup = 'MVL.1';
  defaultTaxonId = 'MX.37580';
  collectionId = 'HR.6778,HR.2691,HR.4731';
}
