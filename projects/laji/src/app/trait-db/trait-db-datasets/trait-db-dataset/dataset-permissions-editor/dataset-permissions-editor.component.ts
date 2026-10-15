import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { components } from 'projects/laji-api-client/generated/api';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { SelectedPerson } from 'projects/laji/src/app/shared-modules/find-person/find-person.component';
import { catchError, filter, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

type PermsResponse = components['schemas']['LajiBackendDatasetPermissions'];
type Person = components['schemas']['SensitivePerson'];
type UserWithPerson = Person & { _tag: 'has-person' };
interface UserWithoutPerson {
  id: string;
  _tag: 'no-person';
};

@Component({
  selector: 'laji-dataset-permissions-editor',
  templateUrl: './dataset-permissions-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class DatasetPermissionsEditorComponent implements OnChanges {
  @Input({ required: true }) perms!: PermsResponse;
  @Output() permsChanged = new EventEmitter<PermsResponse>();

  persons$!: Observable<(UserWithPerson | UserWithoutPerson)[]>;
  selectedPerson: SelectedPerson | undefined;
  validationErrors: string[] = [];

  constructor(private api: LajiApiClientService, private cdr: ChangeDetectorRef) { }

  ngOnChanges(): void {
    this.updatePersons$();
  }

  onGrantPerms(userId: string) {
    if (!userId || this.perms.userIds?.includes(userId)) {
      return;
    }

    this.savePermissions([...(this.perms.userIds ?? []), userId]);
    this.selectedPerson = undefined;
  }

  onRevokePerms(userId: string) {
    this.savePermissions((this.perms.userIds ?? []).filter(id => id !== userId));
  }

  private updatePersons$() {
    this.persons$ = !this.perms.userIds?.length
      ? of([])
      : forkJoin(
        this.perms.userIds.map(id => {
          if (id.includes('@')) {
            return of({ id, _tag: 'no-person' } as UserWithoutPerson);
          }
          return this.api.get('/person/{id}', { path: { id } }).pipe(
            map(person => ({ ...person, _tag: 'has-person' } as UserWithPerson)),
            catchError(err => of({ id, _tag: 'no-person' } as UserWithoutPerson))
          );
        })
      );
  }

  private savePermissions(userIds: string[]) {
    const updatedPerms = { ...this.perms, userIds };
    this.validationErrors = [];

    this.api.fetch(
      '/trait/dataset-permissions/validate-update/{datasetId}',
      'post',
      { path: { datasetId: updatedPerms.datasetId } },
      updatedPerms
    ).pipe(
      tap(validation => {
        this.validationErrors = validation.pass ? [] : Object.values(validation.errors);
        this.cdr.markForCheck();
      }),
      filter(validation => validation.pass),
      switchMap(() => this.api.fetch(
        '/trait/dataset-permissions/{datasetId}',
        'put',
        { path: { datasetId: updatedPerms.datasetId } },
        updatedPerms
      ))
    ).subscribe({
      next: perms => {
        this.permsChanged.next(perms);
        this.updatePersons$();
        this.cdr.markForCheck();
      },
      error: error => {
        this.validationErrors = [error?.error?.message ?? 'Failed to update dataset permissions.'];
        this.cdr.markForCheck();
      }
    });
  }
}
