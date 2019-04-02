import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Taxonomy, TaxonomyDescription} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-occurrence',
  templateUrl: './taxon-occurrence.component.html',
  styleUrls: ['./taxon-occurrence.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonOccurrenceComponent implements OnInit {
  @Input() taxon: Taxonomy;
  @Input() taxonDescription: TaxonomyDescription[];

  constructor() { }

  ngOnInit() {

  }

}
