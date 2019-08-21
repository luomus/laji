import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { WbcResultService, SEASON } from '../wbc-result.service';
import { Subscription } from 'rxjs';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';

@Component({
  selector: 'laji-wbc-censuses',
  templateUrl: './wbc-censuses.component.html',
  styleUrls: ['./wbc-censuses.component.css']
})
export class WbcCensusesComponent implements OnInit  {
  active: 'list'|'map' = 'list';

  activeYear: number;
  activeSeason: SEASON;

  rows: any[];
  selected = [
    'document.namedPlace.name',
    'document.namedPlace.municipalityDisplayName',
    'document.namedPlace.birdAssociationAreaDisplayName',
    'gathering.eventDate.begin',
    'gathering.team',
    'count',
    'individualCountSum'
  ];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'document.namedPlace.birdAssociationAreaDisplayName', dir: 'asc'},
    {prop: 'gathering.eventDate.begin', dir: 'desc'},
  ];

  loading = false;
  queryKey: string;
  resultSub: Subscription;
  filterBy = '';

  constructor(
    private resultService: WbcResultService,
    private documentViewerFacade: DocumentViewerFacade,
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
        });
    }
  }

  openViewer(fullId: string) {
    this.documentViewerFacade.showDocumentID({
      document: fullId,
      useWorldMap: false
    });
  }

  setActive(newActive: 'list'|'map') {
    this.active = newActive;
  }
}
