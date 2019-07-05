import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { SearchQuery } from './search-query.model';
import { UserService } from '../shared/service/user.service';
import { FooterService } from '../shared/service/footer.service';
import { ObservationFacade } from './observation.facade';

@Component({
  selector: 'laji-observation',
  templateUrl: './observation.component.html',
  styles: [`
    :host {
      flex: 1 0 auto;
      display: flex;
      flex-direction: column;
      z-index: auto;
    }
  `],
  providers: [SearchQuery],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationComponent implements OnInit, OnDestroy {
  public tab: string;
  public page: number;
  public options: any;
  public data: any;

  private subParam: Subscription;
  private subQuery: Subscription;

  constructor(
    private observationFacade: ObservationFacade,
    private route: ActivatedRoute,
    private footerService: FooterService,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    public searchQuery: SearchQuery
  ) {
  }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.subParam = this.route.params.subscribe(value => {
      this.tab = value['tab'] || 'map';
    });
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    // Route snapshot is not populated with the latest info when this event is triggered. So we need to delay the execution little.
    setTimeout(() => {
      this.updateQuery(this.route.snapshot.queryParams);
      this.cd.markForCheck();
    });
  }

  private updateQuery(params) {
    const query = this.searchQuery.setQueryFromQueryObject(params);
    if (params['target']) {
      query.target = [params['target']];
    }
    if (query.editorPersonToken === 'true') {
      query.editorPersonToken = this.userService.getToken();
    }
    if (query.observerPersonToken === 'true') {
      query.observerPersonToken = this.userService.getToken();
    }
    if (query.editorOrObserverPersonToken === 'true') {
      query.editorOrObserverPersonToken = this.userService.getToken();
    }
    this.observationFacade.updateQuery(query);
  }
}
