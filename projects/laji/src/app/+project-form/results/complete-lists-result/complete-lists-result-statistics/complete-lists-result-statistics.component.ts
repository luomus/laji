import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'laji-complete-lists-result-statistics',
  templateUrl: './complete-lists-result-statistics.component.html',
  styleUrls: ['./complete-lists-result-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompleteListsResultStatisticsComponent {
  readonly municipality$ = new ReplaySubject<string>();
  readonly taxon$ = new ReplaySubject<string>();
  @Input() set municipality(v: string) { this.municipality$.next(v); };
  @Input() set taxon(v: string) { this.taxon$.next(v); };
}
