import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { WbcResultService, SEASON } from '../wbc-result.service';
import { DatatableColumn } from '../../../../shared-modules/datatable/model/datatable-column';
import { IdService } from '../../../../shared/service/id.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-wbc-censuses',
  templateUrl: './wbc-censuses.component.html',
  styleUrls: ['./wbc-censuses.component.css']
})
export class WbcCensusesComponent implements OnInit  {
  @ViewChild('documentModal') public modal: ModalDirective;

  activeYear: number;
  activeSeason: SEASON;

  rows: any[];
  columns: DatatableColumn[] = [
    {
      name: 'document.namedPlace.name',
      label: 'wbc.stats.routes.name',
      width: 300
    },
    {
      name: 'document.namedPlace.municipalityDisplayName',
      label: 'wbc.stats.routes.municipalityDisplayName'
    },
    {
      name: 'document.namedPlace.birdAssociationAreaDisplayName',
      label: 'wbc.stats.routes.birdAssociationAreaDisplayName',
      width: 300
    },
    {
      name: 'gathering.eventDate.begin',
      label: 'wbc.stats.route.begin'
    },
    {
      name: 'gathering.team',
      label: 'wbc.stats.route.team',
      width: 300
    },
    {
      name: 'count',
      label: 'wbc.stats.route.count'
    },
    {
      name: 'individualCountSum',
      label: 'wbc.stats.route.individualCountSum'
    }
  ];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'document.namedPlace.birdAssociationAreaDisplayName', dir: 'asc'},
    {prop: 'gathering.eventDate.begin', dir: 'desc'},
  ];

  documentModalVisible = false;
  shownDocument: string;

  loading = false;
  queryKey: string;
  resultSub: Subscription;
  filterBy = '';

  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.onFilterChange();
  }

  onFilterChange() {
    if (this.activeYear) {
      const queryKey = 'year:' + this.activeYear + ',season:' + this.activeSeason;
      if (this.loading && this.queryKey === queryKey) {
        return;
      }
      this.queryKey = queryKey;

      if (this.resultSub) {
        this.resultSub.unsubscribe();
      }

      this.loading = true;
      this.resultSub = this.resultService.getCensusList(this.activeYear, this.activeSeason)
        .subscribe(list => {
          this.rows = list;
          this.loading = false;
          this.cd.markForCheck();
        })
    }
  }

  openViewer(fullId: string) {
    this.shownDocument = IdService.getId(fullId);
    this.modal.show();
  }
}
