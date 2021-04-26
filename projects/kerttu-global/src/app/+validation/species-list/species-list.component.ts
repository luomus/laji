import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'laji-species-list',
  templateUrl: './species-list.component.html',
  styleUrls: ['./species-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesListComponent {
  @Input() speciesList: any[];

  @Output() taxonSelect = new EventEmitter<string>();

}
