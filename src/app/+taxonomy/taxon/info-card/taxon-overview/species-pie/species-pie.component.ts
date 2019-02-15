import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { TaxonomyApi } from '../../../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-species-pie',
  templateUrl: './species-pie.component.html',
  styleUrls: ['./species-pie.component.scss']
})
export class SpeciesPieComponent implements OnInit, OnChanges {
  @Input() children: Taxonomy[];
  data: any;
  labelFormatting = this.formatLabel.bind(this);
  valueFormatting = this.formatValue.bind(this);
  total = 0;

  dataById: {[key: string]: Taxonomy} = {};
  private speciesLabel = '';
  private speciesSingularLabel = '';

  @Output() taxonSelect = new EventEmitter<string>();

  constructor(
    private taxonomyService: TaxonomyApi,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.get('taxonomy.species').subscribe(label => { this.speciesLabel = label; });
    this.translate.get('taxonomy.species.singular').subscribe(label => { this.speciesSingularLabel = label; });
  }

  ngOnChanges() {
    this.dataById = {};
    this.total = 0;

    this.data = (this.children || []).reduce((arr: any[], child) => {
      const id = child.id;
      const count = child.countOfFinnishSpecies;
      this.total += count;

      if (count > 0) {
        this.dataById[id] = child;
        arr.push({name: id, value: count});
      }

      return arr;
    }, []);
  }

  private formatLabel(value: any) {
    const data = this.dataById[value.label];
    return data.vernacularName || data.scientificName;
  }

  private formatValue(value: number) {
    return value + ' ' + (value === 1 ? this.speciesSingularLabel : this.speciesLabel);
  }
}
