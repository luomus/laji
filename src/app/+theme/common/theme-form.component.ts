import { Component, Injectable } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { LocalizeRouterService } from 'app/locale/localize-router.service';

@Injectable()
export abstract class ThemeFormComponent {
  abstract onSuccessUrl: string;
  abstract onErrorUrl: string;
  abstract onCancelUrl: string;
  abstract onTmlLoadUrl: string;
  abstract onMissingNamedPlaceUrl: string;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected localizeRouterService: LocalizeRouterService) {}

  protected navigate(route: any[], extras?: NavigationExtras) {
    return this.router.navigate(
      this.localizeRouterService.translateRoute(route), extras
    );
  }

  onTmlLoad(data) {
    this.navigate(
      [this.onTmlLoadUrl, data.tmpID],
      { replaceUrl: true }
    );
  }

  onSuccess(event) {
    this.navigate([this.onSuccessUrl]);
  }

  onError() {
    this.navigate([this.onErrorUrl]);
  }

  onCancel() {
    this.navigate([this.onCancelUrl]);
  }

  onMissingNamedplace() {
    this.navigate(
      [this.onMissingNamedPlaceUrl],
      { replaceUrl: true }
    );
  }
}
