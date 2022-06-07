import { Pipe, PipeTransform } from '@angular/core';
import { Annotation } from '../model/Annotation';
import { AnnotationTag } from '../model/AnnotationTag';
import { IdService } from '../service/id.service';

@Pipe({
  name: 'activeTags',
  pure: false
})

export class UniquePipe implements PipeTransform {


  transform(value: AnnotationTag[], args: Annotation[]): any[] {

    if ( value === undefined || args === undefined ) {
      return value;
    }

    const addedTags: any[] = [];
    const removedTags: any[] = [];
    let active: any[] = [];

    for (const arg of args) {
      if (arg.addedTags) {
        for (const tag of arg.addedTags) {
          if (!arg.deleted) {
            addedTags.push(IdService.getId(tag));
          }
        }
      }

      if (arg.removedTags) {
        for (const tag of arg.removedTags) {
          if (!arg.deleted) {
            removedTags.push(IdService.getId(tag));
          }
        }
      }
    }

    active = this.arrDiff(this.mergeUniqueValues(addedTags), this.mergeUniqueValues(removedTags));

    if (value) {
      value = value.filter(
        item => active.includes(item.id)
      );
    }

    return value;
  }

  mergeUniqueValues(...arrays: any[]) {
    let jointArray: any[] = [];

    arrays.forEach(array => {
        jointArray = [...jointArray, ...array];
    });
    return jointArray.filter((item, index) => jointArray.indexOf(item) === index);
  }


  arrDiff(a1: any[], a2: any[]) {
    const a = [], diff = [];

    for (const a1Item of a1) {
        a[a1Item] = true;
    }

    for (const a2Item of a2) {
        if (a[a2Item]) {
            delete a[a2Item];
        } else {
            a[a2Item] = true;
        }
    }

    for (const k in a) {
      if (a.hasOwnProperty(k)) {
        diff.push(IdService.getId(k));
      }
    }

    return diff;
  }
}


