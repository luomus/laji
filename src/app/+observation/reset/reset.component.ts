import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { ObservationFacade } from '../observation.facade';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetComponent implements OnInit {

  constructor(
    private router: Router,
    private observationFacade: ObservationFacade,
    private localizeRouterService: LocalizeRouterService
  ) {

  }

  ngOnInit() {
    this.observationFacade.clearQuery();
    this.router.navigate(this.localizeRouterService.translateRoute(['/observation/map']), {replaceUrl: true});
  }

}
