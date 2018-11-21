import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizeRouterService } from 'app/locale/localize-router.service';

@Component({
    template: ''
})
export class ThemeFormComponent {
  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected localizeRouterService: LocalizeRouterService) {}

  onTmlLoad(data, url: string) {
    this.router.navigate(
      this.localizeRouterService.translateRoute([url, data.tmpID]),
      { replaceUrl: true }
    );
  }

  onSuccess(url: string, queryParams?) {
    this.router.navigate(this.localizeRouterService.translateRoute([url]),
                         {queryParams: queryParams});
  }

  onError(url: string) {
    this.router.navigate(this.localizeRouterService.translateRoute([url]));
  }

  onCancel(url: string) {
    this.router.navigate(this.localizeRouterService.translateRoute([url]));
  }

  onMissingNamedplace(url: string) {
    this.router.navigate(
      this.localizeRouterService.translateRoute([url]),
      { replaceUrl: true }
    );
  }
}
