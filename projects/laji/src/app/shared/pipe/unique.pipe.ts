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

    const addedTags = [];
    const removedTags = [];
    let active = [];

    for (let i = 0; i < args.length; i++) {
      if (args[i].addedTags) {
        for ( let j = 0; j < args[i].addedTags.length; j++) {
          if (!args[i].deleted) {
            addedTags.push(IdService.getId(args[i].addedTags[j]));
          }
        }
      }

      if (args[i].removedTags) {
        for ( let j = 0; j < args[i].removedTags.length; j++) {
          if (!args[i].deleted) {
          removedTags.push(IdService.getId(args[i].removedTags[j]));
          }
        }
      }
    }

    active = this.arr_diff(this.mergeUniqueValues(addedTags), this.mergeUniqueValues(removedTags));

    if (value) {
      value = value.filter(
        item => active.includes(item.id)
      );
    }

    return value;
  }

  mergeUniqueValues(...arrays) {
    let jointArray = [];

    arrays.forEach(array => {
        jointArray = [...jointArray, ...array];
    });
    const uniqueArray = jointArray.filter((item , index) => jointArray.indexOf(item) === index);

    return uniqueArray;
  }


  arr_diff(a1, a2) {
    const a = [], diff = [];

    for (let i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }

    for (let i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        } else {
            a[a2[i]] = true;
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


