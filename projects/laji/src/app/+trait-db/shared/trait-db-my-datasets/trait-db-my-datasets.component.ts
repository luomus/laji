import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { map, switchMap, filter } from 'rxjs/operators';
import { UserService } from '../../../shared/service/user.service';
import { components } from 'projects/laji-api-client-b/generated/api';

export type Dataset = components['schemas']['Dataset'];

@Component({
  selector: 'laji-trait-db-my-datasets',
  templateUrl: './trait-db-my-datasets.component.html',
  styleUrls: ['./trait-db-my-datasets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbMyDatasetsComponent implements OnInit {
  loggedIn$!: Observable<boolean>;
  datasets$!: Observable<Dataset[]>;

  constructor(
    private api: LajiApiClientBService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loggedIn$ = this.userService.isLoggedIn$;
    this.datasets$ = this.loggedIn$.pipe(
      filter(loggedIn => loggedIn),
      switchMap(_ => this.api.get('/trait/dataset-permissions', {})),
      switchMap(perms => this.api.get('/trait/datasets', {}).pipe(
        map(datasets => datasets.filter(dataset => perms.some(perm => perm.datasetId === dataset.id)))
      ))
    );
  }

  onLogin(event: Event) {
    event.preventDefault();
    this.userService.redirectToLogin();
  }
}

