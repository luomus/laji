import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';

@Component({
  selector: 'laji-informal-group-redirect',
  template: ''
})
export class InformalGroupRedirectComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) { }

  ngOnInit() {
    const params = this.route.snapshot.params;
    this.router.navigate(this.localizeRouterService.translateRoute(['/taxon/list']), {queryParams: {informalGroupFilters: params['id']}});
  }

}
