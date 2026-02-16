import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { isIctAdmin, UserService } from '../../../shared/service/user.service';
import { AbstractCachedHttpService } from '../../../shared/service/abstract-cached-http.service';
import { map, switchMap, take } from 'rxjs/operators';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { IdService } from '../../../shared/service/id.service';
import { AnnotationDW } from '../../annotations/annotation-list/annotation-list.component';

type Annotation = components['schemas']['annotation'];
type AnnotationTag = components['schemas']['tag'];

@Injectable({providedIn: 'root'})
export class AnnotationService extends AbstractCachedHttpService<AnnotationTag> {

  constructor(
    private userService: UserService,
    private api: LajiApiClientBService
  ) {
    super();
  }

  delete(annotation: AnnotationDW) {
    return this.api.delete('/annotations/{id}', { path: { id: IdService.getId(annotation.id)! } });
  }

  save(annotation: Annotation): Observable<Annotation> {
    return this.api.post('/annotations', undefined, annotation);
  }

  getTag(id: string): Observable<AnnotationTag> {
    return this.getAllTags().pipe(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map(tags => tags.find(t => t.id === id)!)
    );
  }

  getAllTags(): Observable<AnnotationTag[]> {
    return this.api.get('/annotations/tags').pipe(map(({results}) => Object.values(results)));
  }

  getAllAddableTags(own = false): Observable<AnnotationTag[]> {
    return this.annotatorsTags('requiredRolesAdd', own);
  }

  getAllRemovableTags(own = false): Observable<AnnotationTag[]> {
    return this.annotatorsTags('requiredRolesRemove', own);
  }

  private annotatorsTags(
    type: keyof Pick<AnnotationTag, 'requiredRolesAdd' | 'requiredRolesRemove'>,
    own: boolean
  ): Observable<AnnotationTag[]> {
    return this.userService.user$.pipe(
      take(1),
      map(user => {
        if (own) {
          return ['MMAN.owner'];
        }
        const roles = [((user && user.roleAnnotation) || 'MMAN.basic')];
        if (isIctAdmin(user)) {
          roles.push('MMAN.ictAdmin');
        }
        return roles;
      }),
      switchMap(annotatorsRole => this.getAllTags().pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map(tags => tags.filter(tag => tag[type] && tag[type]!.some(r => annotatorsRole.includes(r))))
      ))
    );
  }


}
