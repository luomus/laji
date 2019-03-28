import {Component, Input, OnInit, HostBinding} from '@angular/core';
import {Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-endangerment',
  templateUrl: './taxon-endangerment.component.html',
  styleUrls: ['./taxon-endangerment.component.scss'],
})
export class TaxonEndangermentComponent implements OnInit {
  @Input() taxon: Taxonomy;

  constructor() { }

  ngOnInit() {
    console.log(this.taxon);
  }

}
