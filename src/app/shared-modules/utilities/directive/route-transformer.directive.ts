import { Directive, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Global } from '../../../../environments/global';

@Directive({
  selector: '[lajiRouteTransformer]'
})
export class RouteTransformerDirective {

  private static readonly lajiTypes = [Global.type.dev, Global.type.embedded];

  constructor(private el: ElementRef, private router: Router) {}

  @HostListener('click', ['$event'])
  public onClick(event) {
    if (event.target.tagName === 'A') {
      const href: string = event.target.getAttribute('href');
      let target;

      if (!href.startsWith('http')) {
        target = href;
      } else if (href.startsWith(environment.base)) {
        target = href.replace(environment.base, '');
      } else if (RouteTransformerDirective.lajiTypes.includes(environment.type) && href.startsWith('https://laji.fi')) {
        target = href.replace('https://laji.fi', '');
      }

      if (target) {
        this.router.navigate([target]);
        event.preventDefault();
      }
    } else {
      return;
    }
  }

}
