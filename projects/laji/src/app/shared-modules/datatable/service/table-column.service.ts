import { Injectable } from '@angular/core';
import { DatatableColumn } from '../model/datatable-column';
import { ObservationTableColumn } from '../../observation-result/model/observation-table-column';

export interface IColumnGroup<T> {
  header: string;
  fields: Array<keyof T>;
}

export interface IGenericColumn<G extends DatatableColumn> {
  [key: string]: G;
}

@Injectable()
export abstract class TableColumnService<T extends DatatableColumn = DatatableColumn, G = IGenericColumn<T>> {

  protected defaultLabelPrefix = 'result.';

  protected defaultFields: Array<keyof G> = [];

  protected columnGroups: IColumnGroup<G>[][] = [];

  protected allColumns: T[] = [];

  getDefaultFields(): Array<string> {
    return [...this.defaultFields] as Array<string>;
  }

  getRequiredFields(): Array<string> {
    return this.allColumns.reduce((result: string[], f) => {
      if (f.required) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result.push(f.name!);
      }
      return result;
    }, []);
  }

  getColumnGroups(): IColumnGroup<G>[][] {
    return this.columnGroups;
  }

  getColumn(name: string): T | undefined {
    const column = this.allColumns.find(col => col.name === name);
    return column ? this.prepareColumn(column) : undefined;
  }

  getColumns(name: string[]): T[] {
    return name.reduce((all, colName) => {
      const col = this.getColumn(colName);
      if (col) {
        all.push(col);
      }
      return all;
    }, [] as T[]);
  }

  getAllColumns(): T[] {
    return this.allColumns.map(col => this.prepareColumn(col));
  }

  getSelectFields(selected: string[], query?: any): string[] {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.getColumns(selected).map(col => (col as ObservationTableColumn).selectField || col.name!);
  }

  getAllColumnLookup() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.getAllColumns().reduce((prev: Record<string, T>, column: T) => { prev[column.name!] = column; return prev; }, {});
  }

  protected prepareColumn(column: T): T {
    return {
      ...column,
      label: column.label || this.defaultLabelPrefix + column.name
    };
  }
}
