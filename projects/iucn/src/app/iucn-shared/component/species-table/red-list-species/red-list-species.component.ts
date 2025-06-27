import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Params } from '@angular/router';
import { ISelectFields } from '../../../../../../../laji/src/app/shared-modules/select-fields/select-fields/select-fields.component';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

@Component({
  selector: 'iucn-red-list-species',
  templateUrl: './red-list-species.component.html',
  styleUrls: ['./red-list-species.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListSpeciesComponent {

  @Input() species: Taxon[] = [];
  @Input() fields: ISelectFields[] = [];
  @Input() showTaxonLink = true;
  @Input() taxonLinkQueryParams: Params = {};

  constructor() { }

  trackBySpeciesId(index: number, species: Taxon): string|number {
    return species.id || index;
  }

}
