import { Injectable } from '@angular/core';
import { AnnotationApi } from '../../shared/api/AnnotationApi';
import { Observable } from 'rxjs/Observable';
import { Annotation } from '../../shared/model/Annotation';
import { UserService } from '../../shared/service/user.service';
import { IdService } from '../../shared/service/id.service';

@Injectable()
export class AnnotationService {

  constructor(
    private annotationApi: AnnotationApi,
    private userService: UserService
  ) { }

  delete(annotation: Annotation): Observable<any> {
    return this.annotationApi
      .deleteAnnotation(IdService.getId(annotation.id), this.userService.getToken());
  }

  save(annotation: Annotation): Observable<Annotation> {
    return this.annotationApi
      .createAnnotation(annotation, this.userService.getToken());
  }

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
    console.log(status, statusTotal, annotations);
    return Observable.of(status);
  }

}
