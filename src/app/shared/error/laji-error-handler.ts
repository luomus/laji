import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ToastsService } from '../service/toasts.service';
import { TranslateService } from 'ng2-translate';

const pauseBeforeResendError = 1000;

@Injectable()
export class LajiErrorHandler implements ErrorHandler {

  private toastsService;
  private translate;
  private pause = false;

  constructor(private injector: Injector) {}

  handleError(error) {
    console.log(error);
    if (this.pause) {
      return;
    }
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
}
