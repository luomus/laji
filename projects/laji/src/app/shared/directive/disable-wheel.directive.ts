import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[lajiDisableWheel]'
})
export class DisableWheelDirective {
  @HostListener('wheel', ['$event'])
  onWheel(event: any) {
    event.preventDefault();
  }
}

