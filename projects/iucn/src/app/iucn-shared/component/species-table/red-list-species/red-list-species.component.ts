import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Params } from '@angular/router';
import { ISelectFields } from '../../../../../../../laji/src/app/shared-modules/select-fields/select-fields/select-fields.component';

@Component({
  selector: 'laji-red-list-species',
  templateUrl: './red-list-species.component.html',
  styleUrls: ['./red-list-species.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListSpeciesComponent {

  @Input() species = [];
  @Input() fields: ISelectFields[] = [];
  @Input() showTaxonLink = true;
  @Input() taxonLinkQueryParams: Params = {};

  constructor() { }

  trackBySpeciesId(index, species) {
    return species.id || index;
  }

}
