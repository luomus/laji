import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IKerttuTaxon } from '../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListComponent {
  @Input() speciesList: PagedResult<IKerttuTaxon> = {results: [], currentPage: 0, total: 0, pageSize: 0};
  @Input() loading = false;

  showOnlyUnvalidated = false;

  @Output() taxonSelect = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();

}
