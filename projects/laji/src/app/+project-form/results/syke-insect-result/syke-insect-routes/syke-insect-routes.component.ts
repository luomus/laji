import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { SykeInsectResultService } from '../syke-insect-result.service';
import { IdService } from '../../../../shared/service/id.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadedElementsStore } from '../../../../../../../laji-ui/src/lib/tabs/tab-utils';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'laji-syke-insect-routes',
  templateUrl: './syke-insect-routes.component.html',
  styleUrls: ['./syke-insect-routes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SykeInsectRoutesComponent implements OnInit {

  @Input() collectionId!: string;

  data: any;
  selected = [
    'document.namedPlace.name',
    'document.namedPlace.municipalityDisplayName',
    'document.namedPlace.birdAssociationAreaDisplayName',
    'oldestRecord',
    'newestRecord',
    'count'
  ];
  sorts: {prop: string; dir: 'asc'|'desc'}[] = [
    {prop: 'document.namedPlace.birdAssociationAreaDisplayName', dir: 'asc'},
    {prop: 'document.namedPlace.name', dir: 'asc'}
  ];

  route$!: Observable<string>;

  constructor(
    private resultService: SykeInsectResultService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.resultService.getRouteList(this.collectionId)
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
}
