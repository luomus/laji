import { Injectable } from '@angular/core';
import { AnnotationApi } from '../../shared/api/AnnotationApi';
import { Observable } from 'rxjs/Observable';
import { Annotation } from '../../shared/model/Annotation';
import { Observer } from 'rxjs/Observer';
import { UserService } from '../../shared/service/user.service';

@Injectable()
export class AnnotationService {

  private annotations: Annotation[];
  private currentRoot: string;
  private pending: any;

  constructor(
    private annotationApi: AnnotationApi,
    private userService: UserService
  ) { }

  delete(annotation: Annotation): Observable<any> {
    return this.annotationApi.deleteAnnotation(annotation.id, this.userService.getToken())
      .do(() => {
        const curLen = this.annotations.length;
        this.annotations = this.annotations.filter(ann => ann.id !== annotation.id);
        if (curLen === this.annotations.length) {
          this.currentRoot = '';
        }
      });
  }

  save(annotation: Annotation): Observable<Annotation> {
    return this.annotationApi
      .createAnnotation(annotation, this.userService.getToken())
      .do((ann) => {
        if (this.currentRoot === ann.rootID) {
          this.annotations = [ann, ...this.annotations];
        } else {
          this.currentRoot = '';
        }
      });
  }

  getAllFromRoot(rootID: string): Observable<Annotation[]> {
    if (this.currentRoot === rootID) {
      if (this.annotations) {
        return Observable.of(this.annotations);
      }
    } else {
      this.annotations = undefined;
      this.currentRoot = rootID;
      this.pending = this._fetchAll(rootID)
        .map(this.sortAnnotations)
        .do(annotations => this.annotations = annotations)
        .share();
    }

    return Observable.create((observer: Observer<Annotation[]>) => {
      this.pending.subscribe(data => {
        observer.next(data);
        observer.complete();
      });
    });
  }

  getAnnotationClassInEffect(annotations: Annotation[]): Observable<Annotation.AnnotationClassEnum>;
  getAnnotationClassInEffect(rootID: string, targetID: string): Observable<Annotation.AnnotationClassEnum>;
  getAnnotationClassInEffect(
    arg1: string|Annotation[],
    targetID?: string
  ): Observable<Annotation.AnnotationClassEnum> {
    if (typeof arg1 === 'string') {
      return this.getAllFromRoot(arg1)
        .map(annotations => annotations.filter(ann => ann.targetID === targetID))
        .switchMap((annotations) => this.getAnnotationClassInEffect(annotations));
    }
    const classes = Annotation.AnnotationClassEnum;
    const cnt = {
      [classes.AnnotationClassReliable]: 0,
      [classes.AnnotationClassLikely]: 0,
      [classes.AnnotationClassSuspicious]: 0,
      [classes.AnnotationClassUnreliable]: 0
    };
    const persons = {};
    for (const annotation of arg1) {
      if (annotation.type === Annotation.TypeEnum.TypeAcknowledged) {
        break;
      } else if (
          annotation.type !== Annotation.TypeEnum.TypeTaxon ||
          annotation.annotationClass === classes.AnnotationClassNeutral ||
          persons[annotation.annotationByPerson || annotation.annotationBySystem] ||
          typeof cnt[annotation.annotationClass] === 'undefined'
      ) {
        continue;
      }
      persons[annotation.annotationByPerson || annotation.annotationBySystem] = true;
      cnt[annotation.annotationClass]++;
    }
    const total = cnt[classes.AnnotationClassReliable] + cnt[classes.AnnotationClassLikely]
               - (cnt[classes.AnnotationClassSuspicious] + cnt[classes.AnnotationClassUnreliable]);

    if (total > 0) {
      return Observable.of(
        cnt[classes.AnnotationClassReliable] > cnt[classes.AnnotationClassReliable] ?
          classes.AnnotationClassReliable : classes.AnnotationClassLikely
      );
    } else if (total < 0) {
      return Observable.of(
        cnt[classes.AnnotationClassUnreliable] > cnt[classes.AnnotationClassSuspicious] ?
          classes.AnnotationClassUnreliable : classes.AnnotationClassSuspicious
      );
    }
    return Observable.of(classes.AnnotationClassNeutral);
  }

  private _fetchAll(rootID: string, page = 1): Observable<Annotation[]> {
    return this.annotationApi.findAnnotations('' + page, '100', rootID)
      .switchMap(result => {
        if (result.currentPage < result.lastPage) {
          return this._fetchAll(rootID, ++page)
            .map(res => [...result.results, ...res]);
        }
        return Observable.of(result.results);
      });
  }

  private sortAnnotations(annotations: Annotation[]) {
    annotations.sort((a: Annotation, b: Annotation) =>
      parseInt(b.id.replace(/[^\d]/g, ''), 10) - parseInt(a.id.replace(/[^\d]/g, ''), 10)
    );

    return annotations;
  }

}
