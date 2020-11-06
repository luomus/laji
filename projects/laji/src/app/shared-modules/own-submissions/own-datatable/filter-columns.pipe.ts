import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterColumns',
  pure: true
})
export class FilterColumnsPipe implements PipeTransform {
  transform(columns: any[], displaySize, reverse = false): any[] {
    if (!columns) {
      return columns;
    }

    return columns.filter(col => {
      const isVisible = col.mode === 'small' || (col.mode === 'medium' && displaySize !== 'small') || displaySize === 'large';
      return reverse ? !isVisible : isVisible;
    });
  }
}
