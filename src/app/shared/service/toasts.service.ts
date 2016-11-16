import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToastsService {

  constructor(
    private toastr: ToastsManager
  ) {}

  getToests() {
    return this.toastr;
  }

  showSuccess(message: string, title?: string) {
    let time = 2000 + ((message + title).length * 100);
    this.toastr.success(message, title, {toastLife: time, showCloseButton: true});
  }

  showError(message: string, title?: string) {
    let time = 2000 + ((message + title).length * 100);
    this.toastr.error(message, title, {toastLife: time, showCloseButton: true});
  }

  showWarning(message: string, title?: string) {
    let time = 2000 + ((message + title).length * 100);
    this.toastr.warning(message, title, {toastLife: time, showCloseButton: true});
  }

  showInfo(message, title?: string) {
    let time = 2000 + ((message + title).length * 100);
    this.toastr.info(message, title, {toastLife: time, showCloseButton: true});
  }

}
