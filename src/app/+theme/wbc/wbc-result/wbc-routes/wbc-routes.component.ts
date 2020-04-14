import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WbcResultService } from '../wbc-result.service';
import { IdService } from '../../../../shared/service/id.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../locale/localize-router.service';
import { LoadedElementsStore } from '../../../../../../projects/laji-ui/src/lib/tabs/tab-utils';

@Component({
  selector: 'laji-wbc-routes',
  templateUrl: './wbc-routes.component.html',
  styleUrls: ['./wbc-routes.component.css']
})
export class WbcRoutesComponent implements OnInit {
  activeIndex = 0;
  loadedTabs = new LoadedElementsStore(['list', 'map']);
  data: any;
  selected = [
    'document.namedPlace.name',
    'document.namedPlace.municipalityDisplayName',
    'document.namedPlace.birdAssociationAreaDisplayName',
    'oldestRecord',
    'newestRecord',
    'count'
  ];
  sorts: {prop: string, dir: 'asc'|'desc'}[] = [
    {prop: 'document.namedPlace.birdAssociationAreaDisplayName', dir: 'asc'},
    {prop: 'document.namedPlace.name', dir: 'asc'}
  ];


  constructor(
    private resultService: WbcResultService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) { }

  ngOnInit() {
    this.loadedTabs.load(this.activeIndex);
    this.resultService.getRouteList()
      .subscribe(routes => {
        this.data = routes;
        this.cd.markForCheck();
      });
  }

  rowSelect(row: any) {
    const id = IdService.getId(row['document.namedPlace.id']);
    this.router.navigate(
      this.localizeRouterService.translateRoute(['/theme/talvilintulaskenta/stats/routes/' + id])
    );
  }

  setActive(newActive: number) {
    this.activeIndex = newActive;
    this.loadedTabs.load(newActive);
  }
}
