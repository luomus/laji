import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input,
  OnChanges, Output, QueryList, Renderer2, RendererStyleFlags2, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';

type Keyable = string | number | symbol;
type SortFn<T extends Keyable> = <U extends DatatableRow<T>>(rowA: U, rowB: U) => number;
export type DatatableRow<T extends Keyable> = Record<T, any>;
interface BasicColumn<T extends Keyable> {
  title: string;

  /**
   * Sorting function to be used when totalPages === 1 (local sort).
   * Returns a negative number if rowA comes before rowB, 0 if equal, and positive otherwise.
   */
  sortFn?: SortFn<T>;
  sortable?: boolean; // defaults to true
  unselectable?: boolean; // defaults to true
}

/**
 * Default column stringifies the `prop` for each cell. The prop is
 * also used for the default sorting function.
 */
export interface DefaultColumn<T extends Keyable> extends BasicColumn<T> {
  prop: T;
}

interface ColumnWithTemplate<T extends Keyable> extends BasicColumn<T> {
  /**
   * Takes row as template context. Example template:
   * Row:
   *   { title: 'A', prop: 'a', sortable: false, cellTemplate: testTemplate },
   * Template:
   *   <ng-template #testTemplate let-data>data: {{ data.a }}</ng-template>
   */
  cellTemplate: TemplateRef<any>;
}

export interface UnsortableColumnWithTemplate<T extends Keyable> extends ColumnWithTemplate<T> {
  prop?: T;
  sortable: false;
  sortFn: undefined;
}

// can fall back on default sorting fn
export interface SortableColumnWithTemplateAndProp<T extends Keyable> extends ColumnWithTemplate<T> {
  prop: T;
  sortable: true;
}

// no sort fallback when a prop wasn't supplied
export interface SortableColumnWithTemplateButNoProp<T extends Keyable> extends ColumnWithTemplate<T> {
  sortable: true;
  sortFn: SortFn<T>;
}

export type DatatableColumn<T extends Keyable> =
  DefaultColumn<T> | UnsortableColumnWithTemplate<T> | SortableColumnWithTemplateAndProp<T> | SortableColumnWithTemplateButNoProp<T>;

const columnHasTemplate = <T extends Keyable>(col: DatatableColumn<T>):
  col is
    UnsortableColumnWithTemplate<T>
    | SortableColumnWithTemplateAndProp<T>
    | SortableColumnWithTemplateButNoProp<T> =>
  'cellTemplate' in col;

/**
 * Index of the column to sort by referring to the `columns` array, and the direction.
 */
export interface Sort {
  by: number;
  dir: 'ASC' | 'DESC';
}

/*
  <h1>Example usage</h1>

  <lu-datatable
    [rows]="[
      { a: 'somedata', b: 'camel', c: 50, d: 4 },
      { a: 6954, b: 'alpaca', c: 18, d: 4 },
      { a: null, b: 'alpine ibex', c: 18, d: 4 },
      { a: { foo: 'bar' }, b: 'kangaroo', c: 20, d: 2 }
    ]"
    [columns]="[
      { title: 'custom cell template', prop: 'a', sortable: false, cellTemplate: testTemplate },
      { title: 'animal', prop: 'b' }, { title: 'lifespan', prop: 'c' },
      { title: 'number of legs', prop: 'd' }
    ]"
    [defaultColumns]="[0, 1, 2]"
    [totalPages]="1"
    [currentPageIdx]="0"
    [loading]="false"
  ></lu-datatable>
  <ng-template #testTemplate let-row let-p="prop">
    <div style="color: purple;">
      {{ row.a }} = {{ p }}
    </div>
  </ng-template>
 */
@Component({
  selector: 'lu-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: [ './datatable.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableComponent<RowProp extends Keyable> implements OnChanges {
  @Input({ required: true }) rows!: DatatableRow<RowProp>[];
  @Input({ required: true }) columns!: DatatableColumn<RowProp>[];

  /**
   * List of columns to sort by with the first one having the highest priority.
   */
  @Input() sorts: Sort[] = [];

  /**
   * Indices of the columns array that should be displayed by default.
   * Defaults to displaying all columns if left undefined.
   */
  @Input() defaultColumns: number[] | null = null;

  @Input() currentPageIdx = 0;
  @Input() totalPages = 1;
  @Input() loading = false;

  /**
   * The number of ghost rows to render when `loading === true`.
   * Should probably be equal to the number of rows expected
   * to get once loading completes.
   */
  @Input() ghostCount = 10;

  /**
   * Fired when user attempts to change the page using the paginator
   */
  @Output() pageChange = new EventEmitter<number>();

  /**
   * Fired when user attempts to change the sorting, but page count is > 1.
   */
  @Output() sortChange = new EventEmitter<Sort[]>();

  @ViewChildren('headerRef') headerEls!: QueryList<ElementRef>;

  selectedColumns: number[] = [];
  unselectedColumns = new Set<number>();
  uid = Math.random().toString(36).substring(2, 15);
  columnHasTemplate = columnHasTemplate;

  private draggedColumnHeaderIdx = 0;

  constructor(
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.columns) {
      this.selectedColumns = new Array(this.columns.length).fill(0).map((v, idx) => idx);
      this.unselectedColumns.clear();
    }

    if (changes.defaultColumns && this.defaultColumns) {
      this.selectedColumns = this.defaultColumns;
      this.columns
        .map((c, idx) => idx)
        .filter(i => !this.selectedColumns.includes(i))
        .forEach(i => this.unselectedColumns.add(i));
    }
  }

  onAddColumn(event: InputEvent) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    if (!this.unselectedColumns.has(value)) {
      return;
    }
    (event.target as HTMLInputElement).value = '';
    const colIdx = value;
    this.selectedColumns.push(colIdx);
    this.unselectedColumns.delete(colIdx);
  }

  onUnselectColumn(colIdx: number) {
    const selectedColsIdx = this.selectedColumns.findIndex(i => i === colIdx);
    this.selectedColumns.splice(selectedColsIdx, 1);
    this.unselectedColumns.add(colIdx);
  }

  onResizeMouseDown(mouseDownEvent: MouseEvent) {
    const th = this.renderer.parentNode(mouseDownEvent.target);
    const startX = mouseDownEvent.pageX;
    const startWidth = th.offsetWidth;

    // `pointer-events: none` also resets the cursor to default.
    // We want to use `cursor: col-resize` on body, so we are setting
    // `pointer-events: none` on children instead of directly on the body
    Array.from(this.document.body.children).forEach(child => {
      this.renderer.setStyle(child, 'pointer-events', 'none', RendererStyleFlags2.Important);
    });

    this.renderer.setStyle(this.document.body, 'user-select', 'none', RendererStyleFlags2.Important);
    this.renderer.setStyle(this.document.body, 'cursor', 'col-resize', RendererStyleFlags2.Important);
    mouseDownEvent.stopPropagation();

    const destroyMouseMoveListener =
      this.renderer.listen('window', 'mousemove', (mouseMoveEvent: MouseEvent) => {
        const newX = mouseMoveEvent.pageX;
        const newWidth = startWidth + (newX - startX);
        this.renderer.setAttribute(th, 'width', `${newWidth}px`);
        mouseMoveEvent.stopPropagation();
      });
    const destroyMouseUpListener =
      this.renderer.listen('window', 'mouseup', () => {
        Array.from(this.document.body.children).forEach(child => {
          this.renderer.removeStyle(child, 'pointer-events', RendererStyleFlags2.Important);
        });
        this.renderer.removeStyle(this.document.body, 'user-select', RendererStyleFlags2.Important);
        this.renderer.removeStyle(this.document.body, 'cursor', RendererStyleFlags2.Important);

        destroyMouseMoveListener();
        destroyMouseUpListener();
      });
  }

  onTableHeaderDragStart(dragStartEvent: DragEvent, columnIdx: number) {
    if (dragStartEvent.dataTransfer) {
      dragStartEvent.dataTransfer.effectAllowed = 'move';
    }
    this.draggedColumnHeaderIdx = columnIdx;
  }

  onTableHeaderDragEnd(dragEndEvent: DragEvent) {

  }

  onTableHeaderDragOver(dragOverEvent: DragEvent) {
    dragOverEvent.preventDefault();
    if (dragOverEvent.dataTransfer) {
      dragOverEvent.dataTransfer.dropEffect = 'move';
    }
  }

  onTableHeaderDrop(dropEvent: DragEvent) {
    dropEvent.preventDefault();
    const target = (dropEvent.target as Element).closest('th');
    const targetIdx = this.headerEls.toArray().map(el => el.nativeElement).indexOf(target);
    if (this.draggedColumnHeaderIdx !== targetIdx) {
      this.moveColumn(this.draggedColumnHeaderIdx, targetIdx);
    }
  }

  onPageChange(idx: number) {
    this.pageChange.emit(idx);
  }

  onToggleSort(colIdx: number) {
    const existingSortIdx = this.sorts.findIndex(s => s.by === colIdx);
    const newSorts = [...this.sorts];
    if (existingSortIdx >= 0) {
      if (this.sorts[existingSortIdx].dir === 'ASC') {
        // ASC -> DESC
        newSorts[existingSortIdx].dir = 'DESC';
      } else {
        // DESC -> NONE
        newSorts.splice(existingSortIdx, 1);
      }
    } else {
      // NONE -> ASC
      newSorts.unshift(<Sort>{ by: colIdx, dir: 'ASC' });
    }

    if (this.totalPages === 1) {
      this.sorts = newSorts;
      this.performLocalSort();
    } else {
      this.sortChange.emit(newSorts);
    }
  }

  getSortBtnChar(colIdx: number) {
    const t = this.colSortType(colIdx);
    return t === 'ASC' ? '^' : t === 'DESC' ? 'v' : '-';
  }

  colSortType(colIdx: number): 'ASC' | 'DESC' | 'NONE' {
    return this.sorts.find(s => s.by === colIdx)?.dir ?? 'NONE';
  }

  getNestedValue(obj: any, prop: Keyable): any {
    if (typeof prop !== 'string') {
      return obj[prop];
    }
    return prop.split('.').reduce((acc, key) => acc?.[key], obj);
  }

  hasProp(col: any): boolean {
    return 'prop' in col;
  }

  private performLocalSort() {
    for (const sort of [...this.sorts].reverse()) {
      const col = this.columns[sort.by];
      if (col.sortable === false) {
        continue;
      }
      const sortFn = col.sortFn ? col.sortFn
        : (a: DatatableRow<RowProp>, b: DatatableRow<RowProp>) =>
          a[col.prop] > b[col.prop] ? 1 : a[col.prop] < b[col.prop] ? -1 : 0;
      const sortDir = (a: DatatableRow<RowProp>, b: DatatableRow<RowProp>) => {
        if (sort.dir === 'DESC') {
          [b, a] = [a, b];
        }
        return sortFn(a, b);
      };

      this.rows.sort(sortDir);
    }
    this.cdr.markForCheck();
  }

  private moveColumn(fromIdx: number, toIdx: number) {
    const from = this.selectedColumns.splice(fromIdx, 1);
    this.selectedColumns.splice(toIdx, 0, from[0]);
  }
}
