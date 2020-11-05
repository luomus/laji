import {
  Directive,
  ElementRef,
  OnInit, Renderer2
} from '@angular/core';
import { PlatformService } from '../service/platform.service';

@Directive({
  selector: 'input[type=text], input[type=checkbox], button'
})
export class SsrDisableDirective implements OnInit {

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private platformService: PlatformService
  ) {}

  ngOnInit() {
    if (!this.platformService.isServer) {
      return;
    }
    this.renderer.setAttribute(this.el.nativeElement, 'disabled', 'disabled');
  }
}

