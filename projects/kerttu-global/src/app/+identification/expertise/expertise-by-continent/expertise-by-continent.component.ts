import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'laji-expertise-by-continent',
  templateUrl: './expertise-by-continent.component.html',
  styleUrls: ['./expertise-by-continent.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpertiseByContinentComponent {
  @Input() continents: number[] = [];
}
