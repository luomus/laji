import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PlatformService } from './platform.service';
import { IndividualConfig } from 'ngx-toastr/toastr/toastr-config';

@Injectable({providedIn: 'root'})
export class ToastsService {

  constructor(
    private toastr: ToastrService,
    private platformService: PlatformService
  ) {}

  getToests() {
    return this.toastr;
  }

  showSuccess(message: string, title?: string, options?: Partial<IndividualConfig>) {
    this.toast('success', message, title, options);
  }

  showError(message: string, title?: string, options?: Partial<IndividualConfig>) {
    this.toast('error', message, title, options);
  }

  showWarning(message: string, title?: string, options?: Partial<IndividualConfig>) {
    this.toast('warning', message, title, options);
  }

  showInfo(message: string, title?: string, options?: Partial<IndividualConfig>) {
    this.toast('info', message, title, options);
  }

  private toast(type, message, title?: string, options?: Partial<IndividualConfig>) {
    if (!this.platformService.isBrowser) {
      return;
    }
    if (!options) {
      const time = 5000 + ((message + title).length * 100);
      options = {timeOut: time, closeButton: true};
    }
    this.toastr[type](message, title, options);
  }

}
