import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizeRouterService } from 'app/locale/localize-router.service';
import { FormService } from 'app/shared/service/form.service';

@Component({
    template: ''
})
export class ThemeFormComponent {
  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected localizeRouterService: LocalizeRouterService,
    protected formService: FormService) {

  }

  onTmlLoad(data, url: string) {
    this.router.navigate(
      this.localizeRouterService.translateRoute([url, data.tmpID]),
      { replaceUrl: true }
    );
  }

  onSuccess(url: string) {
    this.router.navigate(this.localizeRouterService.translateRoute([url]));
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
