import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { AtlasGrid, AtlasGridSquare } from '../../../core/atlas-api.service';

type DatatableRow = any;

@Component({
  selector: 'ba-grid-index-table',
  templateUrl: './grid-index-table.component.html',
  styleUrls: ['./grid-index-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexTableComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  @Input() set atlasGrid(atlasGrid: AtlasGrid) {
    this.rows = atlasGrid;
    this.search$.next('');
  }
  @Output() selectYKJ = new EventEmitter<string>();

  cols: TableColumn[] = [{
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
    name: this.translate.instant('ba.grid-index.birdSociety'),
    resizeable: false,
    sortable: true,
    width: 350
  }];
  filteredRows$ = new Subject<DatatableRow[]>();
  datatableClasses = datatableClasses;

  private search$ = new BehaviorSubject<string>(undefined);
  private rows: DatatableRow[] = [];

  constructor(
    private translate: TranslateService
  ) {}

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
