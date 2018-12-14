import { Component, OnChanges, Input, ChangeDetectorRef } from '@angular/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';

@Component({
  selector: 'laji-species-pie',
  templateUrl: './species-pie.component.html',
  styleUrls: ['./species-pie.component.scss']
})
export class SpeciesPieComponent implements OnChanges {
  @Input() taxonId: string;
  data: any;
  labelFormatting = this.formatLabel.bind(this);
  total = 0;

  private dataById: {[key: string]: Taxonomy} = {};

  constructor(
    private taxonomyService: TaxonomyApi,
    private translate: TranslateService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.data = undefined;
    this.dataById = {};
    this.total = 0;

    if (this.taxonId) {
      this.taxonomyService.taxonomyFindChildren(
        this.taxonId,
        this.translate.currentLang,
        '1',
        {selectedFields: 'id,vernacularName,scientificName,countOfFinnishSpecies'}
      ).subscribe(children => {
          this.data = children.reduce((arr: any[], child) => {
            const id = child.id;
            const count = child.countOfFinnishSpecies;
            this.total += count;

            if (count > 0) {
              this.dataById[id] = child;
              arr.push({name: id, value: count});
            }

            return arr;
          }, []);
          this.cd.markForCheck();
        });
    }
  }

  onSelect(value: any) {
    const id = value.name;
    this.router.navigate(
      this.localizeRouterService.translateRoute(
        ['/taxon', id]
      )
    );
  }

  private formatLabel(id: string) {
    const data = this.dataById[id];
    return data.vernacularName || data.scientificName;
  }
}
