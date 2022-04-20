import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import { datatableClasses } from 'projects/bird-atlas/src/styles/datatable-classes';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, tap } from 'rxjs/operators';
import { AtlasApiService, AtlasGridSquare } from '../../core/atlas-api.service';
import { ScrollPositionService } from '../../core/scroll-position.service';

type DatatableRow = any;

@Component({
  selector: 'ba-grid-index',
  templateUrl: './grid-index.component.html',
  styleUrls: ['./grid-index.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  private search$ = new Subject<string>();
  private rows: DatatableRow[] = [];
  private rowsInitialized = false;

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
    name: this.translate.instant('ba.grid-index.birdAssociationArea'),
    resizeable: false,
    sortable: true,
    width: 350
  }
  ];
  private filteredRowsSubject = new Subject<DatatableRow[]>();
  filteredRows$ = this.filteredRowsSubject.pipe(tap(() => {
    // recall scroll position on first emit
    if (this.rowsInitialized) { return; }
    this.rowsInitialized = true;
    this.scroll.recallScrollPosition();
  }));
  datatableClasses = datatableClasses;

  constructor(
    private router: Router, private route: ActivatedRoute,
    private atlasApi: AtlasApiService, private translate: TranslateService,
    private scroll: ScrollPositionService
  ) {}

  ngOnInit(): void {
    this.search$.pipe(
      debounceTime(200),
      takeUntil(this.unsubscribe$)
    ).subscribe(s => {
      const filterStr = s.toLowerCase();
      this.filteredRowsSubject.next(
        this.rows.filter(
          r => (r.name + r.coordinates + r.birdAssociationArea.value).toLowerCase().includes(filterStr)
        )
      );
    });
    this.atlasApi.getGrid().subscribe(g => {
      this.rows = g;
      this.search$.next('');
    });
  }

  onActivate(event: { type: string; row: AtlasGridSquare }) {
    if(event.type === 'click') {
      this.router.navigate([event.row.coordinates], { relativeTo: this.route });
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
