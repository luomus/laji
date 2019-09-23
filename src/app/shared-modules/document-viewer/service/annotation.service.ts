import { Injectable } from '@angular/core';
import { Observable, of as ObservableOf } from 'rxjs';
import { Annotation } from '../../../shared/model/Annotation';
import { UserService } from '../../../shared/service/user.service';
import { IdService } from '../../../shared/service/id.service';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { AnnotationTag } from '../../../shared/model/AnnotationTag';
import { AbstractCachedHttpService } from '../../../shared/service/abstract-cached-http.service';
import { map, switchMap, take } from 'rxjs/operators';

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
    return this.fetchById(this.lajiApi.getList(LajiApi.Endpoints.annotationsTags, {lang: lang}), lang, id);
  }

  getAllAddableTags(lang: string): Observable<AnnotationTag[]> {
    return this.annotatorsTags('requiredRolesAdd', lang);
  }

  getAllRemovableTags(lang: string): Observable<AnnotationTag[]> {
    return this.annotatorsTags('requiredRolesRemove', lang);
  }

  private annotatorsTags(
    type: keyof Pick<AnnotationTag, 'requiredRolesAdd' | 'requiredRolesRemove'>,
    lang
  ): Observable<AnnotationTag[]> {
    return this.userService.user$.pipe(
      take(1),
      map(user => (user && user.roleAnnotation) || Annotation.AnnotationRoleEnum.basic),
      switchMap(annotatorsRole => this.fetchList(this.lajiApi.getList(LajiApi.Endpoints.annotationsTags, {lang: lang}), lang).pipe(
        map(tags => tags.filter(tag => tag[type] && tag[type].includes(annotatorsRole)))
      ))
    );
  }

  /**
   * @deprecated
   */
  getAnnotationClassInEffect(annotations: Annotation[]): Observable<Annotation.AnnotationClassEnum>;
  getAnnotationClassInEffect(
    annotations: Annotation[] = []
  ): Observable<Annotation.AnnotationClassEnum> {
    const classes = Annotation.AnnotationClassEnum;
    const cnt = {
      [classes.AnnotationClassReliable]: 0,
      [classes.AnnotationClassLikely]: 0,
      [classes.AnnotationClassSuspicious]: 0,
      [classes.AnnotationClassUnreliable]: 0
    };
    const persons = {};
    let status: Annotation.AnnotationClassEnum;
    for (const annotation of annotations) {
      const annotationType = IdService.getId(annotation.type);
      const annotationClass = IdService.getId(annotation.annotationClass);
      if (annotationType === Annotation.TypeEnum.TypeOpinion &&
          annotationClass === classes.AnnotationClassAcknowledged) {
        break;
      } else if (annotation.annotationBySystem && !status) {
        status = annotationClass;
      } else if (
          annotationType !== Annotation.TypeEnum.TypeOpinion ||
          annotationClass === classes.AnnotationClassNeutral ||
          !annotation.annotationByPerson ||
          persons[annotation.annotationByPerson] ||
          typeof cnt[annotationClass] === 'undefined'
      ) {
        continue;
      }
      persons[annotation.annotationByPerson] = true;
      cnt[annotationClass]++;
      status = classes.AnnotationClassNeutral; // We've got use data so this will always override the machine.
    }
    if (!status && annotations && annotations.length > 0) {
      status = classes.AnnotationClassNeutral;
    }
    const statusTotal = cnt[classes.AnnotationClassReliable] + cnt[classes.AnnotationClassLikely]
               - (cnt[classes.AnnotationClassSuspicious] + cnt[classes.AnnotationClassUnreliable]);

    if (statusTotal > 0) {
      status = cnt[classes.AnnotationClassReliable] > cnt[classes.AnnotationClassReliable] ?
          classes.AnnotationClassReliable : classes.AnnotationClassLikely;
    } else if (statusTotal < 0) {
      status = cnt[classes.AnnotationClassUnreliable] > cnt[classes.AnnotationClassSuspicious] ?
          classes.AnnotationClassUnreliable : classes.AnnotationClassSuspicious;
    }
    return ObservableOf(status);
  }

}
