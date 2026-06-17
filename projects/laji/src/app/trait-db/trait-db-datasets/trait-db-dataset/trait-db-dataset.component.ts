import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { components } from 'projects/laji-api-client/generated/api';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { combineLatest, Observable, of } from 'rxjs';
import { map, filter, distinctUntilChanged, switchMap, startWith, catchError, tap } from 'rxjs';
import { UserService } from '../../../shared/service/user.service';

export type Dataset = components['schemas']['LajiBackendDataset'];
export type DatasetPermissions = components['schemas']['LajiBackendDatasetPermissions'];

@Component({
    templateUrl: './trait-db-dataset.component.html',
    styleUrls: ['./trait-db-dataset.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TraitDbDatasetComponent implements OnInit {
  // null represents a state where we are done querying the api so the loading indicator shouldnt be shown
  data$!: Observable<{
    dataset: Dataset | null | undefined;
    perms: DatasetPermissions | null | undefined;
    hasPerms: boolean;
  }>;

  constructor(
    private route: ActivatedRoute,
    private api: LajiApiClientService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.data$ = this.route.paramMap.pipe(
      map(m => m.get('id')),
      filter(id => !!id),
      distinctUntilChanged(),
      switchMap(id => combineLatest([
        this.api.fetch('/trait/datasets/{id}', 'get', { path: { id: id! } }).pipe(
          startWith(undefined),
          catchError(() => of(null))
        ),
        this.userService.isLoggedIn$.pipe(
          switchMap(loggedIn => loggedIn
            ? this.api.fetch('/trait/dataset-permissions/{datasetId}', 'get', { path: { datasetId: id! } }).pipe(
              startWith(undefined),
              catchError(() => of(null))
            )
            : of(null)
          ),
        ),
        this.userService.user$.pipe(startWith(undefined))
      ])),
      map(([dataset, perms, user]) => ({
        dataset,
        perms,
        hasPerms: !!(perms && user?.id && perms.userIds?.includes(user.id))
      }))
    );
  }
}
