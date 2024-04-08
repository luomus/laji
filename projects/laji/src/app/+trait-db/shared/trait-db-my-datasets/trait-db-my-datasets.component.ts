import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { tap, map, switchMap, filter } from 'rxjs/operators';
import { UserService } from '../../../shared/service/user.service';
import { components } from 'projects/laji-api-client-b/generated/api';

export type Dataset = components['schemas']['Dataset'];

@Component({
  selector: 'laji-trait-db-my-datasets',
  templateUrl: './trait-db-my-datasets.component.html',
  styleUrls: ['./trait-db-my-datasets.component.scss']
})
export class TraitDbMyDatasetsComponent implements OnInit {
  loggedIn$: Observable<boolean>;
  datasets$: Observable<Dataset[]>;

  constructor(
    private api: LajiApiClientBService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loggedIn$ = this.userService.isLoggedIn$;
    this.datasets$ = this.loggedIn$.pipe(
      filter(loggedIn => loggedIn),
      switchMap(_ => this.api.fetch('/trait/dataset-permissions', 'get', { query: { personToken: this.userService.getToken() } })),
      switchMap(perms => this.api.fetch('/trait/datasets', 'get', {}).pipe(
        map(datasets => datasets.filter(dataset => perms.some(perm => perm.datasetId === dataset.id)))
      ))
    );
  }

  onLogin(event: Event) {
    event.preventDefault();
    this.userService.redirectToLogin();
  }
}

