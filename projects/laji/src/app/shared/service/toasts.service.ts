import { Injectable } from '@angular/core';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { PlatformService } from '../../root/platform.service';
import { IndividualConfig } from 'ngx-toastr/toastr/toastr-config';

@Injectable({providedIn: 'root'})
export class ToastsService {

  constructor(
    private toastr: ToastrService,
    private platformService: PlatformService
  ) {}

  showSuccess(message: string, title?: string, options?: Partial<IndividualConfig>): ActiveToast<any> {
    return this.toast('success', message, title, options);
  }

  showError(message: string, title?: string, options?: Partial<IndividualConfig>): ActiveToast<any> {
    return this.toast('error', message, title, options);
  }

  showWarning(message: string, title?: string, options?: Partial<IndividualConfig>): ActiveToast<any> {
    return this.toast('warning', message, title, options);
  }

  showInfo(message: string, title?: string, options?: Partial<IndividualConfig>): ActiveToast<any> {
    return this.toast('info', message, title, options);
  }

  clear(toastId?: number) {
    if (!this.platformService.isBrowser) {
      return;
    }
    this.toastr.clear(toastId);
  }

  private toast(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, options?: Partial<IndividualConfig>): ActiveToast<any> {
    if (!this.platformService.isBrowser) {
      return undefined;
    }
    if (!options) {
      const time = 5000 + ((message + title).length * 100);
      options = {timeOut: time, closeButton: true};
    }
    return this.toastr[type](message, title, options);
  }

}
