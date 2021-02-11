import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NafiBumblebeeResultService } from '../nafi-bumblebee-result.service';
import { IdService } from '../../../../shared/service/id.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadedElementsStore } from '../../../../../../../laji-ui/src/lib/tabs/tab-utils';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-nafi-bumblebee-routes',
  templateUrl: './nafi-bumblebee-routes.component.html',
  styleUrls: ['./nafi-bumblebee-routes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NafiBumblebeeRoutesComponent implements OnInit {

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

  route$: Observable<string>;

  constructor(
    private resultService: NafiBumblebeeResultService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadedTabs.load(this.activeIndex);
    this.resultService.getRouteList()
      .subscribe(routes => {
        this.data = routes;
        this.cd.markForCheck();
      });
    this.route$ = this.route.queryParams.pipe(map(queryMap => queryMap['route']));
  }

  rowSelect(row: any) {
    const route = IdService.getId(row['document.namedPlace.id']);
    this.router.navigate(
      [],
      {queryParams: {route}, queryParamsHandling: 'merge'}
    );
  }

  setActive(newActive: number) {
    this.activeIndex = newActive;
    this.loadedTabs.load(newActive);
  }
}
