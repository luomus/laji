import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TableColumn } from '@achimha/ngx-datatable';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { AtlasGridSquare } from '../../../core/atlas-api.service';

@Component({
  selector: 'ba-grid-index-table',
  templateUrl: './grid-index-table.component.html',
  styleUrls: ['./grid-index-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() atlasGrid!: AtlasGridSquare[];
  @Output() selectYKJ = new EventEmitter<string>();

  cols: TableColumn[];
  filteredRows$ = new Subject<AtlasGridSquare[]>();
  datatableClasses = datatableClasses;

  private unsubscribe$ = new Subject<void>();
  private search$ = new BehaviorSubject<string | undefined>(undefined);
  private rows: AtlasGridSquare[] = [];

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
      name: this.translate.instant('ba.grid-index.birdSociety'),
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
      const filterStr = s!.toLowerCase();
      this.filteredRows$.next(
        this.rows.filter(
          r => (r.name + r.coordinates + r.birdAssociationArea.value).toLowerCase().includes(filterStr)
        )
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.atlasGrid) {
      if (!this.atlasGrid) { return; }
      this.rows = changes.atlasGrid.currentValue;
      this.search$.next('');
    }
  }

  onActivate(event: { type: string; row: AtlasGridSquare }) {
    if(event.type === 'click') {
      this.selectYKJ.emit(event.row.coordinates);
    }
  }

  onSearchKeyUp(event: any) {
    this.search$.next(event.target.value);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
