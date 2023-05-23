import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component,
  ElementRef,
  EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, TemplateRef, ViewChild
} from '@angular/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import { AtlasTaxon } from '../../../core/atlas-api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

type AugmentedAtlasTaxon = AtlasTaxon & {
  classCounts: {
    // the classCounts object contains keys like 'MY.atlasClassEnumD': number;
    // which does not work with ngxDataTable row props
    certain: number;
    all: number;
  };
};

@Component({
  selector: 'ba-bird-society-info-species-table',
  templateUrl: 'bird-society-info-species-table.component.html',
  styleUrls: ['bird-society-info-species-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietyInfoSpeciesTableComponent implements OnChanges, AfterViewInit, OnDestroy, OnInit {
  @ViewChild('alignRight') alignRightTemplate: TemplateRef<any>;
  @ViewChild('textfield') textfieldElement: ElementRef<HTMLInputElement>;

  @Input() taxa: AtlasTaxon[];
  @Output() rowClick = new EventEmitter<AtlasTaxon | null>();

  filteredRows$ = new Subject<AugmentedAtlasTaxon[]>();
  cols: TableColumn[];
  selected: AtlasTaxon[] = [];

  private unsubscribe$ = new Subject<void>();
  private search$ = new BehaviorSubject<string>(undefined);
  private rows: AugmentedAtlasTaxon[];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.search$.pipe(
      filter(s => s !== undefined),
      debounceTime(200),
      takeUntil(this.unsubscribe$)
    ).subscribe(s => {
      const filterStr = s.toLowerCase();
      this.filteredRows$.next(
        this.rows.filter(
          r => (r.vernacularName.fi + r.scientificName).toLowerCase().includes(filterStr)
        )
      );
    });
  }

  ngAfterViewInit(): void {
    this.cols = [{
      prop: 'vernacularName.fi',
      name: 'Nimi',
      resizeable: false,
      sortable: true
    }, {
      prop: 'scientificName',
      name: 'Tieteellinen nimi',
      resizeable: false,
      sortable: true
    }, {
      prop: 'classCounts.certain',
      name: 'Varmat',
      resizeable: false,
      sortable: true,
      maxWidth: 60,
      cellTemplate: this.alignRightTemplate
    }, {
      prop: 'classCounts.all',
      name: 'Kaikki',
      resizeable: false,
      sortable: true,
      maxWidth: 60,
      cellTemplate: this.alignRightTemplate
    }];
  }

  ngOnChanges() {
    this.rows = this.taxa.map(t => (<AugmentedAtlasTaxon>{...t, classCounts: {certain: t.classCounts['MY.atlasClassEnumD'], all: t.classCounts.all}}));
    this.search$.next(this.textfieldElement?.nativeElement?.value ?? '');
  }

  selectCheck(row: AtlasTaxon) {
    return this.selected.indexOf(row) === -1;
  }

  setSelected(selected: AtlasTaxon[]) {
    this.selected = selected;
    this.cdr.markForCheck();
  }

  onActivate(e: any) {
    if (e.type !== 'click') { return; }
    if (this.selected.length > 0) {
      this.rowClick.emit(this.selected[0]);
      return;
    }
    this.rowClick.emit(null);
  }

  onDownloadCsv() {
    const _rows: string[][] = [
      ['Nimi', 'Tieteellinen nimi', 'Varmat', 'Kaikki'],
      ...this.rows.map(r => [r.vernacularName.fi, r.scientificName, `"${r.classCounts.certain}"`, `"${r.classCounts.all}"`])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + _rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  }

  onSearchKeyUp(event) {
    this.search$.next(event.target.value);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
