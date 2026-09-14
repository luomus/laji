import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'joinBy',
    standalone: false
})
export class JoinByPipe implements PipeTransform {
  transform(value: string[], separator: string): string {
    return value.join(separator);
  }
}
