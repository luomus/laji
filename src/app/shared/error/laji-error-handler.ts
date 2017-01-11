import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ToastsService } from '../service/toasts.service';
import { TranslateService } from 'ng2-translate';
import { Logger } from '../logger/logger.service';

const pauseBeforeResendError = 3000;

@Injectable()
export class LajiErrorHandler implements ErrorHandler {

  private toastsService;
  private translate;
  private logger;
  private pause = false;

  constructor(private injector: Injector) {}

  handleError(error) {
    if (this.pause || !error || (typeof error === 'object' && Object.keys(error).length === 0)) {
      return;
    }
    this.getLogger().error('Guru Meditation!', error);
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
