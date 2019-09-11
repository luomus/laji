import { Pipe, PipeTransform } from '@angular/core';
import { Annotation } from '../model/Annotation';

@Pipe({
  name: 'activeTags',
  pure: false
})

export class UniquePipe implements PipeTransform {


  transform(value: Annotation[]): any[] {
    if ( value === undefined) {
      return value;
    }

    if ( value === undefined || !value[0].addedTags || !value[0].removedTags) {
      return value;
    }

    const addedTags = [];
    const removedTags = [];

    for (let i = 0; i < value.length; i++) {
      for ( let j = 0; j < value[i].addedTags.length; j++) {
        addedTags.push(value[i].addedTags[j]);
      }

      for ( let j = 0; j < value[i].removedTags.length; j++) {
        removedTags.push(value[i].removedTags[j]);
      }
    }


    return this.arr_diff(this.mergeArrays(addedTags), this.mergeArrays(removedTags));

  }

  mergeArrays(...arrays) {
    let jointArray = [];

    arrays.forEach(array => {
        jointArray = [...jointArray, ...array];
    });
    const uniqueArray = jointArray.filter((item , index) => jointArray.indexOf(item) === index);
    console.log(uniqueArray);
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
        diff.push(k);
      }
    }

    return diff;
  }
}


