import { Pipe, PipeTransform } from '@angular/core';
import { IPageLayout } from '../label-designer.interface';

/**
 * @internal
 * This pipe changes the order of the labels so that they are mirrored on the page
 * For example with 3x3 layout the order will change like this: 1,2,3,4,5,6,7,8,9 -> 7,8,9,4,5,6,1,2,3
 * 1 4 7      7 4 1
 * 2 5 8  ->  8 5 2
 * 3 6 9      9 6 3
 */
@Pipe({
  name: 'labelBacksideSort'
})
export class LabelBacksideSortPipe implements PipeTransform {
  transform(data: Record<string, any>[], dim: IPageLayout): Record<string, any>[] {
    const sortedData = [];

    let idx = 0;
    while (idx < dim.cols * dim.rows) {
      const columnNbr = Math.floor(idx / dim.rows);
      const rowNbr = idx - (columnNbr * dim.rows);

      const columnStartDataIdx = (dim.cols - columnNbr - 1) * dim.rows;
      const dataIdx = columnStartDataIdx + rowNbr;

      sortedData.push(data[dataIdx]);
      idx++;
    }

    return sortedData;
  }
}
