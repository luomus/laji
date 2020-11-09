import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { Annotation } from '../../../shared/model/Annotation';
import { UserService } from '../../../shared/service/user.service';
import { IdService } from '../../../shared/service/id.service';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { AbstractCachedHttpService } from '../../../shared/service/abstract-cached-http.service';
import { map, switchMap, take } from 'rxjs/operators';
import { MultiLangService } from '../../lang/service/multi-lang.service';

@Injectable({providedIn: 'root'})
export class AnnotationService extends AbstractCachedHttpService<AnnotationTag> {

  constructor(
    private lajiApi: LajiApiService,
    private userService: UserService
  ) {
    super();
  }

  delete(annotation: Annotation): Observable<any> {
    return this.lajiApi.remove(LajiApi.Endpoints.annotations, IdService.getId(annotation.id), {personToken: this.userService.getToken()});
  }

  save(annotation: Annotation): Observable<Annotation> {
    return this.lajiApi.post(LajiApi.Endpoints.annotations, annotation, {personToken: this.userService.getToken()});
  }

  getTag(id: string, lang: string): Observable<AnnotationTag> {
    return this.getAllTags(lang).pipe(
      map(tags => tags.find(t => t.id === id))
    );
  }

  getAllTags(lang: string): Observable<AnnotationTag[]> {
    return this.fetchList(this.lajiApi.getList(LajiApi.Endpoints.annotationsTags, {lang: 'multi'}), 'multi').pipe(
      map(tags => tags.map(t => ({
        ...t,
        name: MultiLangService.getValue(t.name as any, lang),
        description: MultiLangService.getValue(t.description as any, lang)
      })))
    );
  }

  getAllAddableTags(lang: string, own = false): Observable<AnnotationTag[]> {
    return this.annotatorsTags('requiredRolesAdd', lang, own);
  }

  getAllRemovableTags(lang: string, own = false): Observable<AnnotationTag[]> {
    return this.annotatorsTags('requiredRolesRemove', lang, own);
  }

  private annotatorsTags(
    type: keyof Pick<AnnotationTag, 'requiredRolesAdd' | 'requiredRolesRemove'>,
    lang,
    own
  ): Observable<AnnotationTag[]> {
    return this.userService.user$.pipe(
      take(1),
      map(user => {
        if (own) {
          return [Annotation.AnnotationRoleEnum.owner];
        }
        const roles = [((user && user.roleAnnotation) || Annotation.AnnotationRoleEnum.basic)];
        if (UserService.isIctAdmin(user)) {
          roles.push(Annotation.AnnotationRoleEnum.ictAdmin);
        }
        return roles;
      }),
      switchMap(annotatorsRole => this.getAllTags(lang).pipe(
        map(tags => tags.filter(tag => tag[type] && tag[type].some(r => annotatorsRole.includes(r))))
      ))
    );
  }


}
