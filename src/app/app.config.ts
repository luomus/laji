import { Injectable } from '@angular/core';
import * as appConfigJson from '../../config.json';
import { environment } from '../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class AppConfig {
  config: any;

  constructor(
    private translate: TranslateService
  ) {
    try {
      this.config = appConfigJson;
    } catch (e) {
      throw new Error('Place add config.json for your application root!');
    }
  }

  getApiClientBase() {
    return this.config.api_client_base || '/api';
  }

  getEnv() {
    return this.config.env || 'dev';
  }

  getLoginUrl(next = '') {
    return (environment.loginUrl
      + '?target=' + environment.systemID
      + '&redirectMethod=GET&locale=%lang%'
      + '&next=' + next).replace('%lang%', this.translate.currentLang);
  }

  getPersonSelfUrl() {
    return environment.selfPage;
  }

  isFormAllowed(formId: string) {
    const forms = environment.formWhitelist;
    if (forms.length === 0) {
      return true;
    }
    return forms.indexOf(formId) !== -1;
  }

  isAnalyticsDisabled() {
    return !!this.config.disable_analytics;
  }

  isForcedLogin() {
    return !!this.config.force_login;
  }

  isForAuthorities() {
    return !!this.config.for_authorities;
  }
}
