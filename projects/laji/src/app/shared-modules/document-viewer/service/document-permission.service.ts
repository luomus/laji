import { Injectable } from '@angular/core';
import { IdService } from '../../../shared/service/id.service';
import { Observable, of } from 'rxjs';
import { FormPermissionService } from '../../../shared/service/form-permission.service';
import { switchMap, map, catchError } from 'rxjs';
import { UserService } from '../../../shared/service/user.service';
import { DocumentService } from '../../own-submissions/service/document.service';
import { StoreDocument } from '../document-viewer.facade';
import type { components } from 'projects/laji-api-client/generated/api';

type Person = components['schemas']['Person'];

export interface DocumentRights {
  hasEditRights: boolean;
  hasDeleteRights: boolean;
}

@Injectable({ providedIn: 'root' })
export class DocumentPermissionService {
  constructor(
    private userService: UserService,
    private documentService: DocumentService,
    private formPermissionService: FormPermissionService
  ) {}

  getRightsToWarehouseDocument(doc?: any): Observable<DocumentRights> {
    const rights: DocumentRights = { hasEditRights: false, hasDeleteRights: false };

    return this.userService.user$.pipe(
      switchMap(user => {
        if (!user?.id || !doc) {
          return of(rights);
        }

        const editors = doc.linkings?.editors?.map((editor: any) => IdService.getId(editor.id)).filter((id: string|undefined) => !!id) || [];
        rights.hasEditRights = editors.includes(user.id);

        const collectionId = IdService.getId(doc.collectionId);

        return this.userIsFormAdmin(user, collectionId).pipe(
          switchMap(isFormAdmin => {
            if (isFormAdmin) {
              rights.hasEditRights = true;
              rights.hasDeleteRights = true;
              return of(rights);
            }

            const documentId = IdService.getId(doc.documentId);

            if (!(rights.hasEditRights || editors.length === 0) || !documentId) {
              return of(rights);
            }

            return this.documentService.findById(documentId).pipe(
              map(localDoc => {
                rights.hasEditRights = rights.hasEditRights || localDoc.editor === user.id;
                rights.hasDeleteRights = rights.hasDeleteRights || localDoc.creator === user.id;
                return rights;
              }),
              catchError(() => (of(rights)))
            );
          })
        );
      })
    );
  }

  getRightsToLocalDocument(doc: StoreDocument): Observable<DocumentRights> {
    return this.userService.user$.pipe(
      switchMap(user => {
        if (!user?.id) {
          return of({ hasEditRights: false, hasDeleteRights: false });
        }

        if (doc.creator === user.id) {
          return of({ hasEditRights: true, hasDeleteRights: true });
        }

        const isFormAdmin$ = this.userIsFormAdmin(user, doc.collectionID);

        return isFormAdmin$.pipe(
          map(isFormAdmin => {
            console.log('right', {
            hasEditRights: isFormAdmin || doc.editors?.includes(user.id) || false,
            hasDeleteRights: isFormAdmin || doc.creator === user.id
          });
            return {
            hasEditRights: isFormAdmin || doc.editors?.includes(user.id) || false,
            hasDeleteRights: isFormAdmin || doc.creator === user.id
          }})
        );
      })
    );
  }

  private userIsFormAdmin(user: Person, collectionId?: string): Observable<boolean> {
    if (!collectionId) {
      return of(false);
    }

    return this.formPermissionService.getFormPermission(collectionId).pipe(
      map(formPermission => this.formPermissionService.isAdmin(formPermission, user))
    );
  }
}
