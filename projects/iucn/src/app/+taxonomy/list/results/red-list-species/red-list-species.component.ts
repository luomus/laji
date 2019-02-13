import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'laji-red-list-species',
  templateUrl: './red-list-species.component.html',
  styleUrls: ['./red-list-species.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RedListSpeciesComponent {

  @Input() species = [];
  @Input() checklist: string;

}
