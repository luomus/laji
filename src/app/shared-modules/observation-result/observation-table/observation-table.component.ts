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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationTableComponent implements OnInit, OnChanges {
  @ViewChild('dataTable') public datatable: DatatableComponent;

  @Input() query: WarehouseQueryInterface;
  @Input() pageSize = 1000;
  @Input() page = 1;
  @Input() isAggregate = true;
  @Input() selected: string[] = [];
  @Input() height = '100%';
  @Input() showSettingsMenu = false;
  @Input() lang = 'fi';

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectChange = new EventEmitter<string[]>();
  @Output() rowSelect = new EventEmitter<any>();

  modalRef: BsModalRef;
  rows: any[] = [];
  cache: any = {};
  orderBy: string[] = [];
  columnLookup = {};

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: this.pageSize
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
    { name: 'gathering.interpretations.coordinateAccuracy' },
    { name: 'gathering.conversions.ykj10kmCenter', sortable: false},
    { name: 'unit.abundanceString' },
    { name: 'unit.interpretations.individualCount', sortable: false },
    { name: 'unit.lifeStage', cellTemplate: 'warehouseLabel', label: 'observation.form.lifeStage' },
    { name: 'unit.sex', cellTemplate: 'warehouseLabel', label: 'observation.form.sex' },
    { name: 'unit.recordBasis', cellTemplate: 'warehouseLabel', label: 'observation.filterBy.recordBasis' },
    { name: 'document.collectionId', prop: 'document.collection', width: 300, sortable: false },
    { name: 'unit.notes', sortable: false, width: 300, label: 'result.document.notes' },
    { name: 'document.secureLevel', cellTemplate: 'warehouseLabel' },
    { name: 'document.secureReasons', sortable: false },
    { name: 'document.sourceId', prop: 'document.source' },
    { name: 'oldestRecord', width: 85 },
    { name: 'newestRecord', width: 85 },
    { name: 'count', draggable: false, label: 'theme.countShort', width: 65 },
    { name: 'individualCountMax', label: 'theme.individualCountMaxShort', width: 70 },
    { name: 'individualCountSum', label: 'theme.individualCountShort', width: 70 }
  ];

  /*
      {
      field: 'unit.taxonVerbatim,unit.linkings.taxon.vernacularName',
      translation: 'result.unit.taxonVerbatim', visible: true, sortBy: 'unit.linkings.taxon.taxonomicOrder'
    },
    {field: 'gathering.conversions.ykj', visible: false, sortBy: false},
    {field: 'gathering.conversions.euref', visible: false, sortBy: false},
    {field: 'gathering.conversions.wgs84', visible: false, sortBy: false},
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
  }

  refreshTable() {
    this.datatable.refreshTable();
  }

  initColumns() {
    this.allColumns = this.allColumns
      .map(column => {
        this.columnLookup[column.name] = column;
        if (!column.label) {
          column.label = 'result.' + column.name;
        }
        return column;
      });
    this.aggregateBy = [];
    this.columns = this.selected.map(name => {
      this.aggregateBy.push((this.columnLookup[name].aggregateBy || this.columnLookup[name].name)
       + (this.columnLookup[name].sortBy ? ',' + this.columnLookup[name].sortBy : ''));
      return this.columnLookup[name];
    });
    if (this.isAggregate) {
      this.columns.push(this.columnLookup['count']);
    }
  }

  openModal(modal: TemplateRef<any>) {
    this.hasChanges = false;
    this.modalSub = this.modalService.onHide.subscribe(() => {
      if (this.hasChanges) {
        this.selectChange.emit(this.selected);
      }
      this.modalSub.unsubscribe();
    });
    this.modalRef = this.modalService.show(modal);

  }

  toggleSelectedField(field: string) {
    this.hasChanges = true;
    const idx = this.selected.indexOf(field);
    if (idx === -1) {
      this.selected = [...this.selected, field];
    } else {
      this.selected = [
        ...this.selected.slice(0, idx),
        ...this.selected.slice(idx + 1)
      ]
    }
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
    this.loading = true;
    this.changeDetectorRef.markForCheck();
    (this.isAggregate ?
      this.resultService.getAggregate(this.query, this.aggregateBy, page, this.pageSize, this.orderBy, this.lang) :
      this.resultService.getList(this.query, this.selected, page, this.pageSize, this.orderBy, this.lang)
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
