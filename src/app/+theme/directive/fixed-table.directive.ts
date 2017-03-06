import { Input } from '@angular/core';
import { Directive } from '@angular/core';
import { ElementRef } from '@angular/core';
import { AfterViewInit } from '@angular/core';

@Directive({
  selector: 'table[lajiFixedTable]'
})
export class FixedTableDirective implements AfterViewInit {

  @Input('lajiFixedTable') maxHeight: string;

  constructor(private el: ElementRef) {
  }

  ngAfterViewInit() {
    setTimeout(() => { this.initFixedTable(); }, 100);
  }

  initFixedTable() {
    const table = this.el.nativeElement;
    const tableWidth = table.offsetWidth;
    const heads = table.querySelectorAll('thead > tr:first-child > th');
    const cols = table.querySelectorAll('tbody > tr:first-child > td');
    const lastHeaderColumn = table.querySelector('thead > tr:first-child > th:last-child');
    for (const idx in heads) {
      if (!heads.hasOwnProperty(idx)) {
        continue;
      }
      const isLast = lastHeaderColumn === heads[idx];
      const columnWidth = cols[idx] ? cols[idx].offsetWidth : heads[idx].offsetWidth;
      if (heads[idx]) {
        if (isLast) {
          heads[idx].style.minWidth = columnWidth + 'px';
        } else {
          heads[idx].style.width = columnWidth + 'px';
        }
      }
      if (cols[idx]) {
        if (isLast) {
          cols[idx].style.minWidth = columnWidth + 'px';
        } else {
          cols[idx].style.width = columnWidth + 'px';
        }
      }
    }
    for (const elem of table.querySelectorAll('thead tr')) {
      elem.style.display = 'block';
      elem.style.position = 'relative';
    }
    for (const elem of table.querySelectorAll('tbody')) {
      elem.style.display = 'block';
      elem.style.maxHeight = this.maxHeight + 'px';
      elem.style.overflow = 'auto';
      elem.style.width = '100%';
      const scrollBarWidth = elem.offsetWidth - elem.clientWidth;
      if (scrollBarWidth > 0) {
        const lastColumn = elem.querySelector('tr:first-child > td:last-child');
        lastColumn.style.minWidth = (lastColumn.offsetWidth - scrollBarWidth) + 'px';
        lastHeaderColumn.style.paddingRight = (scrollBarWidth + 5) + 'px';
      }
    }
    table.style.width = tableWidth + 'px';
    table.style.tableLayout = 'fixed';
    table.style.borderCollapse = 'collapse';
  }
}
