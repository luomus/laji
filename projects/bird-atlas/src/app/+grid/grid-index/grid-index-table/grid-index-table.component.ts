import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';

@Component({
  selector: 'ba-grid-index-table',
  templateUrl: './grid-index-table.component.html',
  styleUrls: ['./grid-index-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() atlasGrid: AtlasGrid;
  @Output() selectYKJ = new EventEmitter<string>();

  cols: TableColumn[];
  filteredRows$ = new Subject<AtlasGrid>();
  datatableClasses = datatableClasses;

  private unsubscribe$ = new Subject<void>();
  private search$ = new BehaviorSubject<string>(undefined);
  private rows: AtlasGrid = [];

  constructor(
    private translate: TranslateService
  ) {
    this.cols = [{
      prop: 'coordinates',
      name: this.translate.instant('ba.grid-index.coordinates'),
      resizeable: false,
      sortable: true,
      width: 75
    }, {
      prop: 'name',
      name: this.translate.instant('ba.grid-index.name'),
      resizeable: false,
      sortable: true,
      width: 200
    }, {
      prop: 'birdAssociationArea.value',
      name: this.translate.instant('ba.grid-index.birdAssociationArea'),
      resizeable: false,
      sortable: true,
      width: 350
    }];
  }

  ngOnInit(): void {
    this.search$.pipe(
      filter(s => s !== undefined),
      debounceTime(200),
      takeUntil(this.unsubscribe$)
    ).subscribe(s => {
      const filterStr = s.toLowerCase();
      this.filteredRows$.next(
        this.rows.filter(
          r => (r.name + r.coordinates + r.birdAssociationArea.value).toLowerCase().includes(filterStr)
        )
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.atlasGrid) {
      this.rows = changes.atlasGrid.currentValue;
      this.search$.next('');
    }
  }

  onActivate(event: { type: string; row: AtlasGridSquare }) {
    if(event.type === 'click') {
      this.selectYKJ.emit(event.row.coordinates);
    }
  }

  onSearchKeyUp(event) {
    this.search$.next(event.target.value);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
