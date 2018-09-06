import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ToastsService } from '../service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../logger/logger.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

const pauseBeforeResendError = 30000;

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
    if (this.pause || !error || (typeof error === 'object' && error !== null && Object.keys(error).length === 0)) {
      return;
    }
    if (typeof error.message === 'string') {
      if (error.message.indexOf('QuotaExceededError') !== -1 ||
        error.message.indexOf('ExpressionChangedAfterItHasBeenCheckedError:') === 0
      ) {
        this.pauseMessage();
        return super.handleError(error);
      }
    }
    if (this.isScheduled()) {
      this.pauseMessage();
      this.getTranslateService()
        .get(['error.scheduled.title', 'error.scheduled.intro'])
        .subscribe(tranlations => {
          this.getToastsService().showWarning(
            tranlations['error.scheduled.intro'],
            tranlations['error.scheduled.title'],
          );
        });
      return;
    }
    const location = this.injector.get(LocationStrategy);
    const url = location instanceof PathLocationStrategy ? location.path() : '';
    this.getLogger().error('Guru Meditation!', {clientPath: url, error: error, errorMsg: error.toString()});
    this.pauseMessage();
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

  private isScheduled(): boolean {
    const now = new Date();
    if (now.getUTCDay() === 4 && now.getUTCDate() <= 7) {
      const hour = now.getUTCHours();
      if (5 <= hour && hour < 7) {
        return true;
      }
    }
    return false;
  }

  private pauseMessage() {
    this.pause = true;
    setTimeout(() => {
      this.pause = false;
    }, pauseBeforeResendError);
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
