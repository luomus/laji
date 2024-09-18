import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Taxonomy } from '../../../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInfoComponent implements OnChanges {

  @Input() taxon: Taxonomy;

  langs = ['fi', 'sv', 'en', 'se', 'ru'];
  availableVernacularNames: Array<Record<string, string>>;
  availableTaxonNames: {vernacularNames: Array<Record<string, string>>; colloquialVernacularNames: Array<Record<string, string>>};

  protectedUnderNatureConservationAct = false;

  private protectedSpeciesGroups: string[] = [
    'MX.37612', // mammal
    'MX.37580', // bird
    'MX.37610', // reptile
    'MX.37609'  // amphibian
  ];
  private unprotectedAdminStatuses: string[] = [
    'MX.gameMammal',
    'MX.gameBird',
    'MX.unprotectedSpecies'
  ];

  constructor(
    public translate: TranslateService
    ) { }

  ngOnChanges() {
    this.updateLangTaxonNames();
    this.updateProtectedStatus();
  }

  private updateLangTaxonNames() {
    this.availableVernacularNames = [];
    this.availableTaxonNames = {vernacularNames: [], colloquialVernacularNames: []};

    this.langs.forEach(value => {
      if (this.taxon?.vernacularName?.[value]) {
        this.availableVernacularNames.push({lang: value});
        this.availableTaxonNames.vernacularNames.push({lang: value});
      }
      if (this.taxon?.colloquialVernacularName?.[value]) {
        this.availableTaxonNames.colloquialVernacularNames.push({lang: value});
      }
    });
  }

  private updateProtectedStatus() {
    this.protectedUnderNatureConservationAct = (
      this.taxon.species &&
      this.taxon.finnish &&
      !this.taxon.invasiveSpecies &&
      this.protectedSpeciesGroups.some(speciesGroup => this.taxon.parents?.includes(speciesGroup)) &&
      !this.unprotectedAdminStatuses.some(status => this.taxon.administrativeStatuses?.includes(status))
    );
  }
}
