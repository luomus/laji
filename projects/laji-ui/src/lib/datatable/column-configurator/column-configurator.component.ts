import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatatableColumn, Keyable } from '../datatable.component';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'lu-datatable-column-configurator',
  templateUrl: './column-configurator.component.html',
  styleUrl: './column-configurator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe]
})
export class ColumnConfiguratorComponent<RowProp extends Keyable> implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) columns!: DatatableColumn<RowProp>[];
  @Input() initialSelection: number[] = [];

  @Output() selectionSubmit = new EventEmitter<number[]>();

  private currentSelection: number[] = [];

  filteredColumns$!: Observable<[number, DatatableColumn<RowProp>][]>;
  private columns$ = new BehaviorSubject<DatatableColumn<RowProp>[]>([]);
  private filterString$ = new BehaviorSubject('');
  private showOnlySelected$ = new BehaviorSubject(false);

  ngOnInit(): void {
    this.filteredColumns$ = combineLatest(this.columns$, this.filterString$, this.showOnlySelected$).pipe(
      map(([cols, filter, onlySelected]) =>
        cols
          .map((col, idx) => [idx, col] as [number, DatatableColumn<RowProp>])
          .filter(([idx, col]) => {
            const hasFilterStr = col.title.toLowerCase().trim().includes(filter.toLowerCase().trim());
            const isSelected = this.getSelectionIdx(idx) >= 0;
            return hasFilterStr && (!onlySelected || (onlySelected && isSelected));
          })
      )
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.columns) {
      this.columns$.next(changes.columns.currentValue);
    }

    if (changes.initialSelection) {
      // clone array to avoid mutating the input
      // (might be dumb, maybe we should just assume that we can mutate input?)
      this.currentSelection = [...this.initialSelection];
    }
  }

  ngOnDestroy(): void {
    this.onSubmit();
  }

  onNameFilterInput(event: Event) {
    this.filterString$.next((event.target as any).value);
  }

  onShowOnlySelectedToggle(event: Event) {
    this.showOnlySelected$.next((event.target as any).checked);
  }

  onColToggle(colIdx: number, selectionIdx: number) {
    if (selectionIdx < 0) {
      this.currentSelection.push(colIdx);
    } else {
      this.currentSelection.splice(selectionIdx, 1);
    }
    this.showOnlySelected$.next(this.showOnlySelected$.getValue());
  }

  onColMoveUp(event: MouseEvent, selectionIdx: number) {
    event.stopPropagation();
    this.swapSelectionIdx(selectionIdx, selectionIdx + 1);
  }

  onColMoveDown(event: MouseEvent, selectionIdx: number) {
    event.stopPropagation();
    this.swapSelectionIdx(selectionIdx, selectionIdx - 1);
  }

  onSubmit() {
    this.selectionSubmit.emit(this.currentSelection);
  }

  getSelectionIdx(colIdx: number): number {
    return this.currentSelection.findIndex(i => i === colIdx);
  }

  getCanBeMovedUp(selectionIdx: number): boolean {
    return selectionIdx >= 0 && selectionIdx < this.currentSelection.length - 1;
  }

  getCanBeMovedDown(selectionIdx: number): boolean {
    return selectionIdx > 0;
  }

  private swapSelectionIdx(a: number, b: number) {
    const temp = this.currentSelection[a];
    this.currentSelection[a] = this.currentSelection[b];
    this.currentSelection[b] = temp;
  }
}
