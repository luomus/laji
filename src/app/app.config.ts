import { Injectable } from '@angular/core';
import * as appConfigJson from '../../config.json';

@Injectable()
export class AppConfig {
  config: any;

  constructor() {
    try {
      this.config = appConfigJson;
    } catch (e) {
      throw 'Place add config.json for your application root!';
    }
  }

  getApiClientBase() {
    return this.config.api_client_base || '/api';
  }

  getEnv() {
    return this.config.env || 'dev';
  }

  getLoginUrl() {
    return this.config.login_url || '';
  }

  getPersonSelfUrl() {
    return this.config.person_self_url || '';
  }

  isFormAllowed(formId: string) {
    if (!this.config.form_whitelist) {
      return true;
    }
    return this.config.form_whitelist.indexOf(formId) !== -1;
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
