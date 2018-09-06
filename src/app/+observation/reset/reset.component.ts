import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SearchQuery } from '../search-query.model';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetComponent implements OnInit {

  constructor(
    private searchQuery: SearchQuery,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) {

  }

  ngOnInit() {
    this.searchQuery.query = {};
    this.searchQuery.queryUpdate({submit: true});
    this.router.navigate(this.localizeRouterService.translateRoute(['/observation/map']), {replaceUrl: true});
  }

}
