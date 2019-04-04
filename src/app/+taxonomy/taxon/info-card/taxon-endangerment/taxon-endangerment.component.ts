import {Component, Input, OnInit, HostBinding, ChangeDetectionStrategy} from '@angular/core';
import {Taxonomy} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-endangerment',
  templateUrl: './taxon-endangerment.component.html',
  styleUrls: ['./taxon-endangerment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonEndangermentComponent implements OnInit {
  @Input() taxon: Taxonomy;

  constructor() { }

  ngOnInit() {}

}
