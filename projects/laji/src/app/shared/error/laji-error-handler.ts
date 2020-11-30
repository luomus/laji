import { ErrorHandler, Inject, Injectable, Injector, Optional } from '@angular/core';
import { ToastsService } from '../service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../logger/logger.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { RESPONSE } from '@nguniversal/express-engine/tokens';

const pauseBeforeResendError = 30000;

@Injectable()
export class LajiErrorHandler extends ErrorHandler {

  private toastsService: ToastsService;
  private translate: TranslateService;
  private logger: Logger;
  private pause = false;

  constructor(
    private injector: Injector,
    @Optional() @Inject(RESPONSE) private response: any,
  ) {
    super();
  }

  handleError(error) {
    if (this.pause || !error || (typeof error === 'object' && typeof error.message === 'string' && error.message.length === 0)) {
      return super.handleError(error);
    }

    // Send error response code so that pages that have errors would not be indexed
    if (this.response) {
      this.response.statusCode = 500;
      this.response.statusMessage = 'Internal Server Error';
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
      this.getToastsService().showWarning(
        this.getTranslateService().instant('error.scheduled.intro'),
        this.getTranslateService().instant('error.scheduled.title'),
      );
      return super.handleError(error);
    }

    const location = this.injector.get(LocationStrategy);
    const url = location instanceof PathLocationStrategy ? location.path() : '';
    this.getLogger().error('Guru Meditation!', {clientPath: url, error: error, errorMsg: error?.toString()});
    this.pauseMessage();
    this.getToastsService().showError(
      this.getTranslateService().instant('error.500.intro'),
      this.getTranslateService().instant('error.500.title')
    );
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
