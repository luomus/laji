import {
  Component, OnInit, OnChanges, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild, TemplateRef,
  SimpleChanges
} from '@angular/core';
import { WbcResultService, SEASON } from '../../wbc-result.service';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DatatableColumn } from '../../../../../shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'laji-wbc-species-list',
  templateUrl: './wbc-species-list.component.html',
  styleUrls: ['./wbc-species-list.component.css']
})
export class WbcSpeciesListComponent implements OnInit, OnChanges {
  @Input() year: number;
  @Input() season: SEASON;
  @Input() birdAssociationArea: string;
  @Input() onlyCommonSpecies = true;
  @Input() showStatistics = false;
  @Input() filterBy = '';
  @Output() rowSelect = new EventEmitter<string>();

  @ViewChild('scientificName') scientificNameTpl: TemplateRef<any>;

  loading = true;

  rows: any[] = [];
  private allRows: any[] = [];
  private filteredRows: any[] = [];

  columns: DatatableColumn[] = [];
  private defaultColumns: DatatableColumn[] = [];
  private additionalColumns: DatatableColumn[] = [];

  private averageCounts: any;
  private subList: Subscription;
  private queryKey: string;

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.defaultColumns = [
      {
        name: 'unit.linkings.taxon.speciesNameFinnish',
        cellTemplate: 'link',
        label: 'result.unit.taxonVerbatim'
      },
      {
        name: 'unit.linkings.taxon.speciesScientificName',
        cellTemplate: this.scientificNameTpl,
        label: 'result.scientificName'
      },
      {
        name: 'count',
        label: 'wbc.stats.count',
        width: 110
      }
    ];
    this.additionalColumns = [
      {
        name: 'individualCountSum',
        label: 'observation.form.count',
        width: 110
      },
      {
        name: 'frequency',
        label: 'wbc.stats.frequency',
        cellTemplate: 'number',
        width: 110,
        info: 'wbc.stats.frequency.info'
      },
      {
        name: 'abundance',
        label: 'wbc.stats.abundance',
        cellTemplate: 'number',
        width: 180,
        info: 'wbc.stats.abundance.info'
      },
      {
        name: 'abundanceComparison',
        label: 'wbc.stats.abundanceComparison',
        cellTemplate: 'number',
        width: 240,
        info: 'wbc.stats.abundanceComparison.info'
      }
    ];
    this.columns = this.defaultColumns;
    this.getAverageCounts().subscribe(counts => {
      this.averageCounts = counts;
      this.updateSpeciesList();
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.onlyCommonSpecies) {
      this.setRows();
    }

    if (changes.showStatistics) {
      if (this.showStatistics) {
        this.columns = this.defaultColumns.concat(this.additionalColumns);
      } else {
        this.columns = this.defaultColumns;
        if (!(changes.year || changes.season || changes.birdAssociationArea)) {
          return;
        }
      }
    }

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

  private getAverageCounts(): Observable<any> {
    return forkJoin([
      this.resultService.getYears(),
      this.resultService.getIndividualCountSumBySpecies()
    ])
      .pipe(
        map(data => {
          const yearCount = data[0].length;
          const countBySpecies = data[1];
          for (const key in countBySpecies) {
            if (countBySpecies.hasOwnProperty(key)) {
              countBySpecies[key] = countBySpecies[key] / yearCount;
            }
          }
          return countBySpecies;
        })
      )
  }

  private updateSpeciesList() {
    if (!this.averageCounts) {
      return;
    }

    const queryKey = 'year:' + this.year + ',season:' + this.season + ',area:' + this.birdAssociationArea
      + ',showStatistics:' + this.showStatistics;

    if (this.queryKey === queryKey) {
      return;
    }
    this.queryKey = queryKey;

    if (this.subList) {
      this.subList.unsubscribe();
    }
    this.loading = true;
    const showStatistics = this.showStatistics;
    this.subList = this.resultService.getSpeciesList(this.year, this.season, this.birdAssociationArea, !showStatistics)
      .pipe(switchMap(list => (showStatistics ? this.addAdditionalStatistics(list) : of(list))))
      .subscribe(list => {
        this.allRows = list;
        this.filteredRows = this.allRows.filter(val => (this.averageCounts[val['unit.linkings.taxon.speciesId']] >= 1));
        this.setRows();
        this.loading = false;
        this.cd.markForCheck();
      })
  }

  private addAdditionalStatistics(list: any[]) {
    const previousTenYears = this.resultService.getPreviousTenYears(this.year);

    return forkJoin([
      this.resultService.getRouteCountBySpecies(this.year, this.season, this.birdAssociationArea),
      this.resultService.getRouteCount(this.year, this.season, this.birdAssociationArea),
      this.resultService.getRouteLengthSum(this.year, this.season, this.birdAssociationArea),
      this.resultService.getIndividualCountSumBySpecies(previousTenYears, this.season, this.birdAssociationArea),
      this.resultService.getRouteLengthSum(previousTenYears, this.season, this.birdAssociationArea)
    ])
      .pipe(
        map(data => {
          const routeCountBySpecies = data[0];
          const routeCount = data[1];
          const routeLengthSum = data[2] / 10000;
          const individualCountBySpeciesPrevTenYears = data[3];
          const routeLengthSumPrevTenYears = data[4] / 10000;

          list.map((l) => {
            const taxonId = l['unit.linkings.taxon.speciesId'];
            l['frequency'] = ((routeCountBySpecies[taxonId] || 0) / routeCount) * 100;
            l['abundance'] = l.individualCountSum / routeLengthSum;
            l['abundanceComparison'] = l['abundance'] - ((individualCountBySpeciesPrevTenYears[taxonId] || 0) / routeLengthSumPrevTenYears);
          });

          return list;
        })
      )
  }
}
