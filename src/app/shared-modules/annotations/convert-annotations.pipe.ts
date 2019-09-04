import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Annotation } from '../../shared/model/Annotation';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IdService } from '../../shared/service/id.service';

function isAnnotation(object: any): object is Annotation {
  return 'type' in object && (object['type'] === 'http://tun.fi/MAN.typeOpinion' || object['type'] === 'MAN.typeOpinion');
}

@Pipe({
  name: 'convertAnnotations',
  pure: false
})
export class ConvertAnnotationsPipe implements PipeTransform {

  private static cache = {};
  private value = {};

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  transform(value: Annotation | Annotation[]): any {
    console.log('pipe');
    if (Array.isArray(value)) {
      return value.map(v => this.transform(v));
    }
    if (!isAnnotation(value)) {
      return value;
    }
    if (ConvertAnnotationsPipe.cache[value.id]) {
      return ConvertAnnotationsPipe.cache[value.id];
    }
    this.convertOldToNew(value).subscribe((annotation) => {
      this.value = annotation;
      this.cdr.markForCheck();
    });
    return this.value;
  }

  private convertOldToNew(value: Annotation): Observable<Annotation> {
    return this.http.post<Annotation>('https://dev.laji.fi/api/annotations/convert', {
      ...value,
      rootID: IdService.getId(value.rootID),
      targetID: IdService.getId(value.targetID),
      annotationBySystem: IdService.getId(value.annotationBySystem),
      annotationByPerson: IdService.getId(value.annotationByPerson),
      annotationClass: IdService.getId(value.annotationClass),
      id: IdService.getId(value.id),
    } as Annotation).pipe(
      map(annotation => ({
        ...annotation,
        rootID: IdService.getUri(value.rootID),
        targetID: IdService.getUri(value.targetID),
        byPerson: IdService.getUri(value.byPerson),
        bySystem: IdService.getUri(value.bySystem),
        byRole: IdService.getUri(value.byRole),
        addedTags: (value.addedTags || []).map(IdService.getUri),
        removedTags: (value.removedTags || []).map(IdService.getUri),
        id: IdService.getUri(annotation.id),
      })),
      tap(annotation => ConvertAnnotationsPipe.cache[annotation.id] = annotation)
    );
  }

}
