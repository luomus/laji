import { Pipe, PipeTransform } from '@angular/core';
import { IPageLayout } from '../label-designer.interface';

@Pipe({
  name: 'labelBacksideSort'
})
export class LabelBacksideSortPipe implements PipeTransform {
  transform(data: Record<string, any>[], dim: IPageLayout): Record<string, any>[] {
    const sortedData = [];
    let startIdx = (dim.cols - 1) * dim.rows;
    let stopIdx: number;

    while (sortedData.length < dim.cols * dim.rows) {
      stopIdx = startIdx + dim.rows - 1;
      for (let i = startIdx; i <= stopIdx; i++) {
        sortedData.push(data[i]);
      }
      startIdx -= dim.rows;
    }

    return sortedData;
  }
}
