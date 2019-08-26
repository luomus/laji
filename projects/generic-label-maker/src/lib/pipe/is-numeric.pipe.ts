import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isNumeric'
})
export class IsNumericPipe implements PipeTransform {

  private readonly numericReg = new RegExp(/^[0-9]*$/);

  transform(value: any): boolean {
    return this.numericReg.test(value || '');
  }

}
