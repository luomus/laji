import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

@Component({
  selector: 'laji-taxon-info',
  templateUrl: './taxon-info.component.html',
  styleUrls: ['./taxon-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaxonInfoComponent implements OnChanges {
  @Input() taxon!: Taxon;

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
    this.updateProtectedStatus();
  }

  private updateProtectedStatus() {
    this.protectedUnderNatureConservationAct = !!(
      this.taxon.species &&
      this.taxon.finnish &&
      !this.taxon.invasiveSpecies &&
      this.protectedSpeciesGroups.some(speciesGroup => this.taxon.parents?.includes(speciesGroup)) &&
      !this.unprotectedAdminStatuses.some(status => this.taxon.administrativeStatuses?.includes(status))
    );
  }

  getItemValue(item: any) {
    return item.value.lang;
  }
}
