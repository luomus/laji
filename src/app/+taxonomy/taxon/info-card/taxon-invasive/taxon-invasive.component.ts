import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Taxonomy, TaxonomyDescription, TaxonomyDescriptionGroup} from '../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-invasive',
  templateUrl: './taxon-invasive.component.html',
  styleUrls: ['./taxon-invasive.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInvasiveComponent implements OnInit {
  @Input() taxon: Taxonomy;
  @Input() taxonDescription: TaxonomyDescription[];

  constructor() { }

  ngOnInit() { }

}
