import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-taxon-status',
  templateUrl: './taxon-status.component.html',
  styleUrls: ['./taxon-status.component.css']
})
export class TaxonStatusComponent {

  statuses: string[] = [
    'MX.iucnRE',
    'MX.iucnCR',
    'MX.iucnEN',
    'MX.iucnVU',
    'MX.iucnNT',
    'MX.iucnLC'
  ];

  @Input() status: string;

}
