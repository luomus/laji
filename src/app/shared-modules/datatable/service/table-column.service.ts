import { Injectable } from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';

export interface IColumnGroup<T> {
  header: string;
  fields: Array<keyof T>;
}

export interface IGenericColumn {
  [key: string]: DatatableColumn;
}

@Injectable()
export abstract class TableColumnService<T extends DatatableColumn = DatatableColumn, G = IGenericColumn> {

  protected defaultLabelPrefix = 'result.';

  protected defaultFields: Array<keyof G> = [];

  protected columnGroups: IColumnGroup<G>[][] = [];

  protected allColumns: T[] = [];

  getDefaultFields(): Array<string> {
    return [...this.defaultFields] as Array<string>;
  }

  getColumnGroups(): IColumnGroup<G>[][] {
    return this.columnGroups;
  }

  getColumn(name: string): T {
    const column = this.allColumns.find(col => col.name === name);
    return column ? this.prepareColumn(column) : undefined;
  }

  getColumns(name: string[]): T[] {
    return name.map(n => this.getColumn(n));
  }

  getAllColumns(): T[] {
    return this.allColumns.map(col => this.prepareColumn(col));
  }

  getSelectFields(selected: string[], query?: any): string[] {
    const columnLookup = this.getAllColumnLookup();

    return selected.map(field => columnLookup[field].selectField || field);
  }

  getAllColumnLookup() {
    return this.getAllColumns().reduce((prev, column) => { prev[column.name] = column; return prev; }, {});
  }

  protected prepareColumn(column: T): T {
    return {
      ...column,
      label: column.label || this.defaultLabelPrefix + column.name
    };
  }
}
