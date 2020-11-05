import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {

  transform(value: any): any {
    if (Array.isArray(value)) {
      return value.map((v, i) => this.toUpperOrLowerCase(v, i !== 0));
    }

    return this.toUpperOrLowerCase(value);
  }

  private toUpperOrLowerCase(value: any, lowerCase = false) {
    if (!value || value.length === 0) {
      return value;
    }
    return (lowerCase ? value.charAt(0).toLowerCase() : value.charAt(0).toUpperCase()) + value.slice(1);
  }
}
