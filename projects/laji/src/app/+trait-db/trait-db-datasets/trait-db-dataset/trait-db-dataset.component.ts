import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { components } from 'projects/laji-api-client-b/generated/api';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { combineLatest, Observable, of } from 'rxjs';
import { map, filter, distinctUntilChanged, switchMap, startWith, catchError, tap } from 'rxjs/operators';
import { UserService } from '../../../shared/service/user.service';

export type Dataset = components['schemas']['Dataset'];
export type DatasetPermissions = components['schemas']['DatasetPermissions'];

@Component({
  templateUrl: './trait-db-dataset.component.html',
  styleUrls: ['./trait-db-dataset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TraitDbDatasetComponent implements OnInit {
  // null represents a state where we are done querying the api so the loading indicator shouldnt be shown
  data$: Observable<{ dataset: Dataset | undefined; perms: DatasetPermissions | null | undefined }>;

  constructor(
    private route: ActivatedRoute,
    private api: LajiApiClientBService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.data$ = this.route.paramMap.pipe(
      map(m => m.get('id')),
      filter(id => !!id),
      distinctUntilChanged(),
      switchMap(id => combineLatest([
        this.api.fetch('/trait/datasets/{id}', 'get', { path: { id } }).pipe(
          startWith(undefined),
          catchError(() => of(null))
        ),
        this.userService.isLoggedIn$.pipe(
          switchMap(loggedIn => loggedIn
            ? this.api.fetch('/trait/dataset-permissions/{datasetId}', 'get', { path: { datasetId: id } }).pipe(
              startWith(undefined),
              catchError(() => of(null))
            )
            : of(null)
          ),
        )
      ])),
      map(([dataset, perms]) => ({ dataset, perms }))
    );
  }
}

