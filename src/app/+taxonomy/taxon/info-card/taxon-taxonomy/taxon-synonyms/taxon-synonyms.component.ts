import {Component, OnInit, Input, ChangeDetectionStrategy} from '@angular/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-synonyms',
  templateUrl: './taxon-synonyms.component.html',
  styleUrls: ['./taxon-synonyms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonSynonymsComponent implements OnInit {
  @Input() taxon: Taxonomy;
  @Input() synonymTypes: string[] = [];

  constructor() { }

  ngOnInit() {
  }

}
