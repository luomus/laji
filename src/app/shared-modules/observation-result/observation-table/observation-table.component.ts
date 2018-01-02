import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { ObservationListService } from '../service/observation-list.service';
import { PagedResult } from '../../../shared/model/PagedResult';
import { ObservationTableColumn } from '../model/observation-table-column';
import { BsModalService, ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import { DatatableComponent } from '../../datatable/datatable/datatable.component';
import { Logger } from '../../../shared/logger/logger.service';


@Component({
  selector: 'laji-observation-table',
  templateUrl: './observation-table.component.html',
  styleUrls: ['./observation-table.component.css'],
  providers: [ObservationListService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationTableComponent implements OnInit, OnChanges {
  @ViewChild('dataTable') public datatable: DatatableComponent;
  @ViewChild('settingsModal') public modalRef: ModalDirective;

  @Input() query: WarehouseQueryInterface;
  @Input() pageSize;
  @Input() page = 1;
  @Input() isAggregate = true;
  @Input() height = '100%';
  @Input() showSettingsMenu = false;
  @Input() showPageSize = true;
  @Input() lang = 'fi';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() virtualScrolling = true;
  @Input() defaultOrder: string;
  @Input() visible: boolean;
  @Input() allAggregateFields = [
    'unit.species',
    'unit.linkings.taxon.vernacularName',
    'unit.linkings.taxon.scientificName',
    'unit.taxonVerbatim',
    'unit.linkings.taxon.taxonomicOrder',
    'document.collectionId',
    'document.sourceId',
    'unit.superRecordBasis',
    'unit.media.mediaType'
  ];

  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() selectChange = new EventEmitter<string[]>();
  @Output() rowSelect = new EventEmitter<any>();

  cache: any = {};
  orderBy: string[] = [];
  columnLookup = {};
  _selected: string[] = [];
  _originalSelected: string[] = [];
  _selectedNumbers: string[] = [];
  _originalSelectedNumbers: string[] = [];

  result: PagedResult<any> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };
  loading: boolean;
  loadingPage: number;

  private langMap = {
    'fi': 'Finnish',
    'sv': 'Swedish',
    'en': 'English'
  };

  columns: ObservationTableColumn[] = [];

  allColumns: ObservationTableColumn[] = [
    { name: 'unit.taxon',
      prop: 'unit',
      target: '_blank',
      label: 'result.unit.taxonVerbatim',
      cellTemplate: 'taxon',
      sortBy: 'unit.linkings.taxon.name%longLang%',
      selectField: 'unit',
      aggregateBy: 'unit.linkings.taxon.id,' +
      'unit.linkings.taxon.nameFinnish,' +
      'unit.linkings.taxon.nameEnglish,' +
      'unit.linkings.taxon.nameSwedish,' +
      'unit.linkings.taxon.scientificName' +
      'unit.linkings.taxon.cursiveName',
      width: 300
    },
    { name: 'unit.taxonVerbatim',
      prop: 'unit.taxonVerbatim',
      label: 'taxonVerbatim' },
    { name: 'unit.linkings.taxon.vernacularName',
      cellTemplate: 'multiLang',
      sortBy: 'unit.linkings.taxon.name%longLang%',
      label: 'taxonomy.vernacular.name',
      aggregateBy: 'unit.linkings.taxon.id,' +
      'unit.linkings.taxon.nameFinnish,' +
      'unit.linkings.taxon.nameEnglish,' +
      'unit.linkings.taxon.nameSwedish' },
    { name: 'unit.linkings.taxon.scientificName',
      prop: 'unit.linkings.taxon',
      cellTemplate: 'scientificName',
      label: 'result.scientificName',
      selectField: 'unit.linkings.taxon.scientificName,unit.linkings.taxon.cursiveName',
      sortBy: 'unit.linkings.taxon.scientificName',
      aggregateBy: 'unit.linkings.taxon.id,unit.linkings.taxon.scientificName,unit.linkings.taxon.cursiveName' },
    { name: 'unit.linkings.taxon.taxonomicOrder',
      label: 'result.taxonomicOrder',
      aggregateBy: 'unit.linkings.taxon.id,unit.linkings.taxon.taxonomicOrder',
      width: 70 },
    { name: 'unit.species',
      prop: 'unit',
      target: '_blank',
      label: 'result.unit.taxonVerbatim',
      cellTemplate: 'species',
      sortBy: 'unit.linkings.taxon.speciesName%longLang%',
      selectField: 'unit',
      aggregateBy: 'unit.linkings.taxon.speciesId,' +
      'unit.linkings.taxon.speciesNameFinnish,' +
      'unit.linkings.taxon.speciesNameEnglish,' +
      'unit.linkings.taxon.speciesNameSwedish,' +
      'unit.linkings.taxon.speciesScientificName',
      width: 300
    },
    { name: 'unit.linkings.species.vernacularName',
      prop: 'unit.linkings.taxon.speciesVernacularName',
      cellTemplate: 'multiLang',
      sortBy: 'unit.linkings.taxon.speciesName%longLang%',
      label: 'taxonomy.vernacular.name',
      aggregateBy: 'unit.linkings.taxon.speciesId,' +
      'unit.linkings.taxon.speciesNameFinnish,' +
      'unit.linkings.taxon.speciesNameEnglish,' +
      'unit.linkings.taxon.speciesNameSwedish' },
    { name: 'unit.linkings.species.scientificName',
      prop: 'unit.linkings.taxon.speciesScientificName',
      label: 'result.scientificName',
      cellTemplate: 'cursive',
      sortBy: 'unit.linkings.taxon.speciesScientificName',
      aggregateBy: 'unit.linkings.taxon.speciesId,unit.linkings.taxon.speciesScientificName' },
    { name: 'unit.linkings.species.taxonomicOrder',
      prop: 'unit.linkings.taxon.speciesTaxonomicOrder',
      label: 'result.taxonomicOrder',
      aggregateBy: 'unit.linkings.taxon.species,unit.linkings.taxon.speciesTaxonomicOrder',
      width: 70 },
    { name: 'unit.reportedTaxonConfidence', cellTemplate: 'warehouseLabel' },
    { name: 'unit.quality.taxon.reliability', cellTemplate: 'warehouseLabel', label: 'result.unit.quality.taxon' },
    { name: 'unit.quality.taxon.source', cellTemplate: 'warehouseLabel', label: 'result.unit.quality.source' },
    { name: 'gathering.team', cellTemplate: 'toSemicolon' },
    { name: 'gathering.interpretations.countryDisplayname', label: 'result.gathering.country' },
    { name: 'gathering.interpretations.biogeographicalProvinceDisplayname', label: 'result.gathering.biogeographicalProvince' },
    { name: 'gathering.interpretations.municipalityDisplayname', label: 'observation.form.municipality' },
    { name: 'gathering.locality' },
    { name: 'gathering.displayDateTime' },
    { name: 'gathering.interpretations.coordinateAccuracy', cellTemplate: 'numeric' },
    { name: 'gathering.conversions.ykj10kmCenter', sortable: false},
    { name: 'unit.abundanceString', cellTemplate: 'numeric', sortBy: 'unit.interpretations.individualCount,unit.abundanceString' },
    { name: 'unit.interpretations.individualCount', cellTemplate: 'numeric' },
    { name: 'unit.lifeStage', cellTemplate: 'warehouseLabel', label: 'observation.form.lifeStage' },
    { name: 'unit.sex', cellTemplate: 'warehouseLabel', label: 'observation.form.sex' },
    { name: 'unit.recordBasis', cellTemplate: 'warehouseLabel', label: 'observation.filterBy.recordBasis' },
    { name: 'unit.media.mediaType', cellTemplate: 'warehouseLabel', label: 'observation.filterBy.image' },
    { name: 'document.collectionId', prop: 'document.collection', width: 300, sortable: false },
    { name: 'unit.notes', sortable: false, label: 'result.document.notes' },
    { name: 'document.secureLevel', cellTemplate: 'warehouseLabel' },
    { name: 'document.secureReasons', sortable: false, cellTemplate: 'warehouseLabel' },
    { name: 'document.sourceId', prop: 'document.source', sortable: false },
    { name: 'document.quality.reliabilityOfCollection'},
    { name: 'unit.det'},
    { name: 'gathering.conversions.dayOfYearBegin'},
    { name: 'gathering.conversions.dayOfYearEnd'},
    { name: 'unit.superRecordBasis', cellTemplate: 'warehouseLabel', label: 'observation.active.superRecordBasis' },
    { name: 'oldestRecord', width: 85 },
    { name: 'newestRecord', width: 85 },
    { name: 'count', draggable: false, label: 'theme.countShort', width: 75, cellTemplate: 'numeric' },
    { name: 'individualCountMax', label: 'theme.individualCountMax', width: 80, cellTemplate: 'numeric' },
    { name: 'individualCountSum', label: 'theme.individualCount', width: 80, cellTemplate: 'numeric' },
    { name: 'gathering.conversions.ykj', prop: 'gathering.conversions.ykj.verbatim', sortable: false },
    { name: 'gathering.conversions.ykj10km', prop: 'gathering.conversions.ykj10km.verbatim', sortable: false },
    { name: 'gathering.conversions.ykj10kmCenter', prop: 'gathering.conversions.ykj10kmCenter.verbatim', sortable: false },
    { name: 'gathering.conversions.ykj1km', prop: 'gathering.conversions.ykj1km.verbatim', sortable: false },
    { name: 'gathering.conversions.ykj1kmCenter', prop: 'gathering.conversions.ykj1kmCenter.verbatim', sortable: false },
    { name: 'gathering.conversions.euref', prop: 'gathering.conversions.euref.verbatim', sortable: false },
    { name: 'gathering.conversions.wgs84', prop: 'gathering.conversions.wgs84.verbatim', sortable: false },
    { name: 'gathering.interpretations.coordinateAccuracy' }
  ];

  private numberFields = ['oldestRecord', 'newestRecord', 'count', 'individualCountMax', 'individualCountSum'];

  private modalSub: Subscription;
  private fetchSub: Subscription;
  private queryKey: string;
  private hasChanges = false;
  private aggregateBy: string[] = [];

  constructor(
    private resultService: ObservationListService,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private logger: Logger
  ) { }

  @Input() set selected(sel: string[]) {
    const selected = [];
    const selectedNumbers = [];
    sel.map(field => {
      if (this.numberFields.indexOf(field) > -1) {
        selectedNumbers.push(field);
      } else {
        if (this.allColumns.find((col) => col.name === field)) {
          selected.push(field);
        }
      }
    });
    this._selected = selected;
    this._selectedNumbers = selectedNumbers;
    this._originalSelected = [...selected];
    this._originalSelectedNumbers = [...selectedNumbers];
  };

  @Input() showRowAsLink = true;

  ngOnInit() {
    this.initColumns();
    this.fetchPage(this.page);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      this.initColumns();
      this.fetchPage(changes.page ? this.page : 1);
    }
    if ((changes.query && !changes.query.isFirstChange())
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
       + (this.columnLookup[name].sortBy ? ',' + this.setLangParams(this.columnLookup[name].sortBy) : ''));
      return this.columnLookup[name];
    });
  }

  openModal() {
    this.hasChanges = false;
    this.modalRef.show();
    this.modalSub = this.modalRef.onHide.subscribe((modal: ModalDirective) => {
      if (modal.dismissReason !== null) {
        this._selected = [...this._originalSelected];
        this._selectedNumbers = [...this._originalSelectedNumbers];
      }
      this.modalSub.unsubscribe();
    })
  }

  closeOkModal() {
    if (this.hasChanges) {
      this.orderBy = [];
      this.selectChange.emit([...this._selected, ...this._selectedNumbers]);
    }
    this.modalRef.hide();
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

  onReorder(event) {
    if (
      !event.column ||
      !event.column.name ||
      this._selected.indexOf(event.column.name) === -1 ||
      typeof event.newValue !== 'number' ||
      typeof event.prevValue !== 'number'
    ) {
      return;
    }
    this._selected.splice(event.newValue, 0, this._selected.splice(event.prevValue, 1)[0]);
    this.selectChange.emit([...this._selected, ...this._selectedNumbers]);
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
    this.fetchPage(pageInfo.offset + 1)
  }

  onSort(event) {
    this.orderBy = event.sorts.map(sort => {
      const col = this.columns.filter(column => column.prop === sort.prop)[0];
      if (!col) {
        return '';
      }
      const sortBy: string =  this.setLangParams(col.sortBy || '' + col.prop);
      return sortBy.split(',').map(val => val + ' ' + sort.dir.toUpperCase()).join(',');
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
    const queryKey = JSON.stringify(this.query) + [this.pageSize, page].join(':');
    if (this.loading && this.queryKey === queryKey) {
      return;
    }
    this.queryKey = queryKey;
    if (this.fetchSub) {
      this.fetchSub.unsubscribe();
    }
    this.loading = true;
    this.changeDetectorRef.markForCheck();
    const aggregate$ = this.resultService.getAggregate(
      this.query,
      [...this.aggregateBy, this.defaultOrder],
      page,
      this.pageSize,
      [...this.orderBy, this.defaultOrder],
      this.lang
    );
    const list$ = this.resultService.getList(
      this.query,
      this.getSelectFields(this._selected, this.query),
      page,
      this.pageSize,
      [...this.orderBy, this.defaultOrder],
      this.lang
    );

    this.fetchSub = (this.isAggregate ? aggregate$ : list$)
      .subscribe(data => {
        this.result = data;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      }, (err) => {
        this.loading = false;
        this.changeDetectorRef.markForCheck();
        this.logger.error('Observation table data handling failed!', err);
      });
  }

  private getSelectFields(selected: string[], query: WarehouseQueryInterface) {
    const selects = selected.map(field => this.columnLookup[field].selectField || field);
    if (query.editorPersonToken || query.observerPersonToken || query.editorOrObserverPersonToken) {
      selects.push('document.quality,gathering.quality,unit.quality');
    }
    return selects;
  }

  private setLangParams(value: string) {
    return (value || '')
      .replace('%longLang%', this.langMap[this.lang] || 'Finnish')
  }
}
