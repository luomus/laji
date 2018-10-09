import { Component, OnInit, OnChanges, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { WbcResultService, SEASON } from '../../wbc-result.service';
import { Subscription } from 'rxjs';
import { DatatableColumn } from '../../../../../shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-wbc-species-result-list',
  templateUrl: './wbc-species-result-list.component.html',
  styleUrls: ['./wbc-species-result-list.component.css']
})
export class WbcSpeciesResultListComponent implements OnInit, OnChanges {
  @Input() year: number;
  @Input() season: SEASON;
  @Input() birdAssociationArea: string;
  @Output() rowSelect = new EventEmitter<string>();

  @ViewChild('name') nameTpl: TemplateRef<any>;
  @ViewChild('scientificName') scientificNameTpl: TemplateRef<any>;

  loading = false;

  onlyCommonSpecies = true;
  private commonLimit = 50;

  rows: any[] = [];
  private allRows: any[] = [];
  private filteredRows: any[] = [];

  columns: DatatableColumn[] = [];
  private defaultColumns: DatatableColumn[] = [];
  private additionalColumns: DatatableColumn[] = [];

  private subList: Subscription;
  private queryKey: string;

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.defaultColumns = [
      {
        name: 'unit.linkings.taxon.nameFinnish',
        cellTemplate: 'link',
        label: 'result.unit.taxonVerbatim'
      },
      {
        name: 'unit.linkings.taxon.scientificName',
        cellTemplate: this.scientificNameTpl,
        label: 'result.scientificName'
      },
      {
        name: 'count',
        label: 'wbc.stats.count'
      }
    ];
    this.columns = this.defaultColumns;
    this.updateSpeciesList();
  }

  ngOnChanges() {
    this.updateSpeciesList();
  }

  setRows() {
    this.rows = this.onlyCommonSpecies ? [...this.filteredRows] : [...this.allRows];
  }

  onSort(event) {
    if (event.sorts.length < 1) {
      this.setRows();
    }
  }

  private updateSpeciesList() {
    const queryKey = 'year:' + this.year + ',season:' + this.season + ',area:' + this.birdAssociationArea;
    if (this.loading && this.queryKey === queryKey) {
      return;
    }
    this.queryKey = queryKey;

    if (this.subList) {
      this.subList.unsubscribe();
    }
    this.loading = true;
    this.subList = this.resultService.getSpeciesList(this.year, this.season, this.birdAssociationArea)
      .subscribe(list => {
        this.allRows = list;
        this.filteredRows = this.allRows.filter(val => (val.count >= this.commonLimit));
        this.setRows();
        this.loading = false;
        this.cd.markForCheck();
      });
  }
}
