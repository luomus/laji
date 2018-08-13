import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';

@Injectable({providedIn: 'root'})
export class ToastsService {

  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getToests() {
    return this.toastr;
  }

  showSuccess(message: string, title?: string, options?: Object) {
    this.toast('success', message, title, options);
  }

  showError(message: string, title?: string, options?: Object) {
    this.toast('error', message, title, options);
  }

  showWarning(message: string, title?: string, options?: Object) {
    this.toast('warning', message, title, options);
  }

  showInfo(message: string, title?: string, options?: Object) {
    this.toast('info', message, title, options);
  }

  private toast(type, message, title?: string, options?: Object) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!options) {
      const time = 4000 + ((message + title).length * 100);
      options = {toastLife: time, showCloseButton: true};
    }
    this.toastr[type](message, title, options);
  }

}
