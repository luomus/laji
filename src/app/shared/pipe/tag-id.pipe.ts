import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { AnnotationTag } from '../../shared/model/AnnotationTag';
import { AnnotationService } from '../../shared-modules/document-viewer/service/annotation.service';
import {map} from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'idTag',
  pure: false
})

export class IdTagPipe implements PipeTransform {
private tagID: any;
private arrayYags: AnnotationTag[];

    constructor(
        private annotationService: AnnotationService,
        private translate: TranslateService,
        private cd: ChangeDetectorRef
    ) { }

  transform(value: string, args: AnnotationTag[]): any {

    return value;
 }

}


