import { Component, Input, OnInit } from '@angular/core';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent implements OnInit {

  public taxon: Taxonomy;
  public activeIucnYear: number;

  constructor(
    private taxonService: TaxonomyApi,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
  }

  @Input()
  set taxonId(id: string) {
    if (!id) {
      this.taxon = null;
      return;
    }
    this.taxonService.taxonomyFindBySubject(id, this.translateService.currentLang, {includeMedia: true}).pipe(
      map(data => this.mock(data))
    )
      .subscribe(taxon => {
        this.activeIucnYear = taxon.latestRedListStatusFinland && taxon.latestRedListStatusFinland.year || null;
        this.taxon = taxon;
      });
  }

  private mock(taxon: Taxonomy): Taxonomy {
    if (taxon.redListStatusesInFinland) {
      taxon.redListStatusesInFinland = taxon.redListStatusesInFinland.map((status, idx) => {
        (status as any).criteria = ['D1', 'A2bf+F2s', 'R2 D2', 'C+3F3D', 'C3PO', 'R2-D2'][idx % 6];
        (status as any).reasons = ['Pyynti\nRakentaminen maalla', '', '', '', '', 'Piip piip'][idx % 6];
        (status as any).threats = ['Pyynti', '', '', '', 'Eksyminen', 'Lyhyet jalat'][idx % 6];
        return status;
      })
    }
    return taxon;
  }

}
