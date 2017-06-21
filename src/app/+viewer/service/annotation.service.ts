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

}
