import { Pipe, PipeTransform } from '@angular/core';
import { IFormField, splitType } from '../../../../+haseka/tools/model/excel';
import { GeneratorService } from '../../service/generator.service';

@Pipe({
  name: 'canSplitTo'
})
export class CanSplitToPipe implements PipeTransform {

  transform(value: string|IFormField, to: splitType): any {
    const key = typeof value === 'string' ? value : value.key;
    return GeneratorService.splittableFields[key] === to;
  }

}
