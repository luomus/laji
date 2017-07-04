import { Injectable, Injector } from '@angular/core';
import { ToastsService } from '../service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../logger/logger.service';
import { LocationStrategy } from '@angular/common';
import { PathLocationStrategy } from '@angular/common';
import { ErrorHandler } from '@angular/core';

const pauseBeforeResendError = 3000;

@Injectable()
export class LajiErrorHandler extends ErrorHandler {

  private toastsService;
  private translate;
  private logger;
  private pause = false;

  constructor(private injector: Injector) {
    super();
  }

  handleError(error) {
    if (this.pause || !error || (typeof error === 'object' && Object.keys(error).length === 0)) {
      return;
    }
    if (error.message && error.message.indexOf('ExpressionChangedAfterItHasBeenCheckedError:') === 0) {
      return super.handleError(error);
    }
    const location = this.injector.get(LocationStrategy);
    const url = location instanceof PathLocationStrategy ? location.path() : '';
    this.getLogger().error('Guru Meditation!', {clientPath: url, error: error});
    this.pause = true;
    setTimeout(() => {
      this.pause = false;
    }, pauseBeforeResendError);
    this.getTranslateService()
      .get(['error.500.title', 'error.500.intro'])
      .subscribe(tranlations => {
        this.getToastsService().showError(
          tranlations['error.500.intro'],
          tranlations['error.500.title']
        );
      });
    return super.handleError(error);
  }

  private getToastsService(): ToastsService {
    if (!this.toastsService) {
      this.toastsService = this.injector.get(ToastsService);
    }
    return this.toastsService;
  }

  private getTranslateService(): TranslateService {
    if (!this.translate) {
      this.translate = this.injector.get(TranslateService);
    }
    return this.translate;
  }

  private getLogger(): Logger {
    if (!this.logger) {
      this.logger = this.injector.get(Logger);
    }
    return this.logger;
  }
}
