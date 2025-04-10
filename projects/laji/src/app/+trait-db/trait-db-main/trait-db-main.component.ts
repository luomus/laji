import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { map } from 'rxjs/operators';
import { UserService } from '../../shared/service/user.service';
import { components } from 'projects/laji-api-client-b/generated/api';

interface Counts {
  entries: number;
  traits: number;
  datasets: number;
}

export type Dataset = components['schemas']['Dataset'];

@Component({
  templateUrl: './trait-db-main.component.html',
  styleUrls: ['./trait-db-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbMainComponent implements OnInit {
  counts$!: Observable<Counts>;

  constructor(
    private api: LajiApiClientBService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.counts$ = forkJoin({
      entries:
        this.api.get('/trait/search', { query: { pageSize: 1 } }).pipe(
          map(res => res.total ?? 0)
        ),
      traits:
        this.api.get('/trait/traits', {}).pipe(
          map(res => res.length ?? 0)
        ),
      datasets:
        this.api.get('/trait/datasets', {}).pipe(
          map(res => res.length ?? 0)
        )
    });
  }

  onLogin(event: Event) {
    event.preventDefault();
    this.userService.redirectToLogin();
  }
}
