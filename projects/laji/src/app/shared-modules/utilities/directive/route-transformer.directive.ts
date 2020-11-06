import { Directive, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Global } from '../../../../environments/global';

@Directive({
  selector: '[lajiRouteTransformer]'
})
export class RouteTransformerDirective {

  private static readonly lajiTypes = [Global.type.dev, Global.type.prod, Global.type.embedded];

  constructor(private el: ElementRef, private router: Router) {}

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent) {
    const href: string = this.getLinkHRef(event.target);

    if (href) {
      let target;

      if (!href.startsWith('http')) {
        target = href;
      } else if (href.startsWith(environment.base)) {
        target = href.replace(environment.base, '');
      } else if (RouteTransformerDirective.lajiTypes.includes(environment.type)) {
        const normalizedHref = href
          .replace('http://', 'https://')
          .replace('www.laji.fi', 'laji.fi');
        if (normalizedHref.startsWith('https://laji.fi')) {
          target = href.replace('https://laji.fi', '');
        }
      }

      if (target) {
        this.router.navigateByUrl(target);
        event.preventDefault();
      }
    } else {
      return;
    }
  }

  private getLinkHRef(target: any): string {
    if (target instanceof HTMLElement) {
      if (target.tagName === 'A') {
        return this.openInSameWindow(target) ?  target.getAttribute('href') : '';
      } else if (target.parentElement) {
        return this.getLinkHRef(target.parentElement);
      }
    }
    return '';
  }

  private openInSameWindow(element: HTMLElement) {
    return !(element.hasAttribute('target') && element.getAttribute('target').toLocaleLowerCase() === '_blank');
  }

}
