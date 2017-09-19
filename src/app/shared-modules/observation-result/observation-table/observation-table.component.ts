import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { ObservationListService } from '../service/observation-list.service';
import { PagedResult } from '../../../shared/model/PagedResult';
import { ObservationTableColumn } from '../model/observation-table-column';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import { DatatableComponent } from '../../datatable/datatable/datatable.component';


@Component({
  selector: 'laji-observation-table',
  templateUrl: './observation-table.component.html',
  styleUrls: ['./observation-table.component.css'],
  providers: [ObservationListService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationTableComponent implements OnInit, OnChanges {
  @ViewChild('dataTable') public datatable: DatatableComponent;

  @Input() query: WarehouseQueryInterface;
  @Input() pageSize;
  @Input() page = 1;
  @Input() isAggregate = true;
  @Input() height = '100%';
  @Input() showSettingsMenu = false;
  @Input() lang = 'fi';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() virtualScrolling = true;
  @Input() defaultOrder: string;
  @Input() visible: boolean;

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectChange = new EventEmitter<string[]>();
  @Output() rowSelect = new EventEmitter<any>();

  modalRef: BsModalRef;
  cache: any = {};
  orderBy: string[] = [];
  columnLookup = {};
  _selected: string[] = [];
  _selectedNumbers: string[] = [];

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  loading: boolean;
  loadingPage: number;

  columns: ObservationTableColumn[] = [];

  allColumns: ObservationTableColumn[] = [
    { name: 'unit.linkings.taxon', cellTemplate: 'vernacularName', sortBy: 'unit.linkings.taxon.nameFinnish',
      label: 'taxonomy.vernacular.name',
      aggregateBy: 'unit.linkings.taxon.nameFinnish,unit.linkings.taxon.id' },
    { name: 'unit.linkings.taxon.scientificName', label: 'result.scientificName', sortBy: 'unit.linkings.taxon.scientificName',
      aggregateBy: 'unit.linkings.taxon.scientificName,unit.linkings.taxon.id' },
    { name: 'unit.linkings.taxon.taxonomicOrder', label: 'result.taxonomicOrder',
      aggregateBy: 'unit.linkings.taxon.taxonomicOrder,unit.linkings.taxon.id', width: 70 },
    { name: 'unit.reportedTaxonConfidence', cellTemplate: 'warehouseLabel' },
    { name: 'unit.quality.taxon.reliability', cellTemplate: 'warehouseLabel', label: 'result.unit.quality.taxon' },
    { name: 'gathering.team', cellTemplate: 'toSemicolon' },
    { name: 'gathering.interpretations.countryDisplayname', label: 'result.gathering.country' },
    { name: 'gathering.interpretations.biogeographicalProvinceDisplayname', label: 'result.gathering.biogeographicalProvince' },
    { name: 'gathering.interpretations.municipalityDisplayname', label: 'observation.form.municipality' },
    { name: 'gathering.locality' },
    { name: 'gathering.displayDateTime' },
    { name: 'gathering.interpretations.coordinateAccuracy', cellTemplate: 'numeric' },
    { name: 'gathering.conversions.ykj10kmCenter', sortable: false},
    { name: 'unit.abundanceString', cellTemplate: 'numeric' },
    { name: 'unit.interpretations.individualCount', sortable: false, cellTemplate: 'numeric' },
    { name: 'unit.lifeStage', cellTemplate: 'warehouseLabel', label: 'observation.form.lifeStage' },
    { name: 'unit.sex', cellTemplate: 'warehouseLabel', label: 'observation.form.sex' },
    { name: 'unit.recordBasis', cellTemplate: 'warehouseLabel', label: 'observation.filterBy.recordBasis' },
    { name: 'unit.media.mediaType', cellTemplate: 'warehouseLabel', label: 'observation.filterBy.image' },
    { name: 'document.collectionId', prop: 'document.collection', width: 300, sortable: false },
    { name: 'unit.notes', sortable: false, width: 300, label: 'result.document.notes' },
    { name: 'document.secureLevel', cellTemplate: 'warehouseLabel' },
    { name: 'document.secureReasons', sortable: false, cellTemplate: 'warehouseLabel' },
    { name: 'document.sourceId', prop: 'document.source' },
    { name: 'unit.superRecordBasis', cellTemplate: 'warehouseLabel', label: 'observation.active.superRecordBasis' },
    { name: 'oldestRecord', width: 85 },
    { name: 'newestRecord', width: 85 },
    { name: 'count', draggable: false, label: 'theme.countShort', width: 75, cellTemplate: 'numeric' },
    { name: 'individualCountMax', label: 'theme.individualCountMax', width: 80, cellTemplate: 'numeric' },
    { name: 'individualCountSum', label: 'theme.individualCount', width: 80, cellTemplate: 'numeric' },
    { name: 'gathering.conversions.ykj', sortable: false },
    { name: 'gathering.conversions.euref', sortable: false },
    { name: 'gathering.conversions.wgs84', sortable: false },
    { name: 'gathering.interpretations.coordinateAccuracy' }
  ];

  private numberFields = ['oldestRecord', 'newestRecord', 'count', 'individualCountMax', 'individualCountSum'];

  /*
      {
      field: 'unit.taxonVerbatim,unit.linkings.taxon.vernacularName',
      translation: 'result.unit.taxonVerbatim', visible: true, sortBy: 'unit.linkings.taxon.taxonomicOrder'
    },
    {}
   */

  private modalSub: Subscription;
  private hasChanges = false;
  private aggregateBy: string[] = [];

  constructor(
    private resultService: ObservationListService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService
  ) { }

  @Input() set selected(sel: string[]) {
    const selected = [];
    const selectedNumbers = [];
    sel.map(field => {
      if (this.numberFields.indexOf(field) > -1) {
        selectedNumbers.push(field);
      } else {
        selected.push(field);
      }
    });
    this._selected = selected;
    this._selectedNumbers = selectedNumbers;
  };

  ngOnInit() {
    this.initColumns();
    this.fetchPage(this.page);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      this.initColumns();
      this.fetchPage(changes.page ? this.page : 1);
    } else if ((changes.query && !changes.query.isFirstChange())
        || (changes.page && !changes.page.isFirstChange())
        || (changes.pageSize && !changes.pageSize.isFirstChange())) {
      this.fetchPage(changes.page ? this.page : 1);
    }
    if (changes.visible && this.visible) {
      this.refreshTable();
    }
  }

  refreshTable() {
    this.datatable.refreshTable();
  }

  initColumns() {
    const selected = this.isAggregate ? [...this._selected, 'count', ...this._selectedNumbers] : [...this._selected];
    this.allColumns = this.allColumns
      .map(column => {
        this.columnLookup[column.name] = column;
        if (!column.label) {
          column.label = 'result.' + column.name;
        }
        return column;
      });
    this.aggregateBy = [];
    this.columns = selected.map(name => {
      this.aggregateBy.push((this.columnLookup[name].aggregateBy || this.columnLookup[name].name)
       + (this.columnLookup[name].sortBy ? ',' + this.columnLookup[name].sortBy : ''));
      return this.columnLookup[name];
    });
  }

  openModal(modal: TemplateRef<any>) {
    this.hasChanges = false;
    this.modalSub = this.modalService.onHide.subscribe(() => {
      if (this.hasChanges) {
        this.selectChange.emit([...this._selected, ...this._selectedNumbers]);
      }
      this.modalSub.unsubscribe();
    });
    this.modalRef = this.modalService.show(modal);

  }

  toggleSelectedNumberField(field: string) {
    this.hasChanges = true;
    const idx = this._selectedNumbers.indexOf(field);
    if (idx === -1) {
      this._selectedNumbers = [...this._selectedNumbers, field];
    } else {
      this._selectedNumbers = [
        ...this._selectedNumbers.slice(0, idx),
        ...this._selectedNumbers.slice(idx + 1)
      ]
    }
  }

  toggleSelectedField(field: string) {
    this.hasChanges = true;
    const idx = this._selected.indexOf(field);
    if (idx === -1) {
      this._selected = [...this._selected, field];
    } else {
      this._selected = [
        ...this._selected.slice(0, idx),
        ...this._selected.slice(idx + 1)
      ]
    }
  }

  clear() {
    this.hasChanges = true;
    this._selected = [];
    this._selectedNumbers = [];
  }

  setPage(pageInfo) {
    const pageWanted = pageInfo.offset + 1;
    if (this.loadingPage !== pageWanted) {
      this.loadingPage = pageWanted;
      this.result.currentPage = pageWanted;
      this.fetchPage(pageWanted);
    }
  }

  onSort(event) {
    this.orderBy = event.sorts.map(sort => {
      const col = this.columns.filter(column => column.prop === sort.prop)[0];
      if (!col) {
        return '';
      }
      return (col.sortBy || col.prop) + ' ' + sort.dir.toUpperCase();
    });
    this.fetchPage(this.page);
  }

  onPageSizeChange(size: number) {
    this.pageSizeChange.emit(size);
  }

  fetchPage(page = 1) {
    if (!this.pageSize) {
      return;
    }
    this.loading = true;
    this.changeDetectorRef.markForCheck();
    (this.isAggregate ?
      this.resultService.getAggregate(
        this.query,
        [...this.aggregateBy, this.defaultOrder],
        page,
        this.pageSize,
        [...this.orderBy, this.defaultOrder],
        this.lang
      ) :
      this.resultService.getList(this.query, this._selected, page, this.pageSize, [...this.orderBy, this.defaultOrder], this.lang)
    ).subscribe(data => {
        this.result = data;
        this.loading = false;

        this.changeDetectorRef.markForCheck();
      }, (err) => {
        this.loading = false;

        this.changeDetectorRef.markForCheck();
      });
  }
}
