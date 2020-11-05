import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PlatformService } from './platform.service';

@Injectable({providedIn: 'root'})
export class ToastsService {

  constructor(
    private toastr: ToastrService,
    private platformService: PlatformService
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
    if (!this.platformService.isBrowser) {
      return;
    }
    if (!options) {
      const time = 4000 + ((message + title).length * 100);
      options = {toastLife: time, showCloseButton: true};
    }
    this.toastr[type](message, title, options);
  }

}
