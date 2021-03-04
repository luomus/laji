import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { SEASON, NafiBumblebeeResultService } from '../nafi-bumblebee-result.service';
import { Subscription } from 'rxjs';
import { DocumentViewerFacade } from '../../../../shared-modules/document-viewer/document-viewer.facade';
import { LoadedElementsStore } from '../../../../../../../laji-ui/src/lib/tabs/tab-utils';

@Component({
  selector: 'laji-nafi-bumblebee-censuses',
  templateUrl: './nafi-bumblebee-censuses.component.html',
  styleUrls: ['./nafi-bumblebee-censuses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeCensusesComponent implements OnInit {

  @Input() collectionId: string;

  activeIndex = 0;
  loadedTabs = new LoadedElementsStore(['list', 'map']);

  activeYear: number;
  activeSeason: SEASON;

  rows: any[];
  selected = [
    'document.namedPlace.name',
    'document.namedPlace.municipalityDisplayName',
    'document.namedPlace.birdAssociationAreaDisplayName',
    'gathering.eventDate.begin',
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
    private resultService: NafiBumblebeeResultService,
    private documentViewerFacade: DocumentViewerFacade,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadedTabs.load(this.activeIndex);
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
      this.resultSub = this.resultService.getCensusList(this.activeYear, this.activeSeason, undefined, this.collectionId)
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

  setActive(newActive: number) {
    this.activeIndex = newActive;
    this.loadedTabs.load(newActive);
  }
}
